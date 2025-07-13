import { ChannelSendQueue } from "./channelSendQueue";

interface PeerConnectionWrapper {
	conn: RTCPeerConnection;
	channels: {
		unorderedReliable: RTCDataChannel | null;
		orderedReliable: RTCDataChannel | null;
		unreliable: RTCDataChannel | null;
	};
	state: RTCIceConnectionState;
	lastPing: number | null;
	isReady: boolean;
	peerId: string;
	peerAlias: string;
}

class ClientWebRTC {
	public tag: string;
	public ws: WebSocket | null = null;
	private SUBPROTOCOL: string = "c2multiplayer";
	public isLoggedIn: boolean = false;
	public isConnected: boolean = false;
	public isHost: boolean = false;
	public myid: string | null = null;
	public hostId: string | null = null;
	public game: string | null = null;
	public instance: string | null = null;
	public room: string | null = null;
	public isOnRoom: boolean = false;
	public connectionsWebRTC: Map<string, PeerConnectionWrapper> = new Map();
	public ice_servers = null;
	public simLatency: number = 0; // in milliseconds
	public simPdv: number = 0; // in milliseconds
	public simPacketLoss: number = 0; // percentage
	public sendQueues: Map<string, ChannelSendQueue> = new Map();

	public onConnectedToSignallingServer: (tag: string) => void;
	public onLoggedIn: (tag: string) => void;
	public onJoinedRoom: (tag: string) => void;
	public onPeerJoined: (peerId: string, peerAlias: string, tag: string) => void;

	constructor(
		tag: string,
		onConnectedToSignallingServer: (tag: string) => void,
		onLoggedIn: (tag: string) => void,
		onJoinedRoom: (tag: string) => void,
		onPeerJoined: (peerId: string, peerAlias: string, tag: string) => void
	) {
		this.onConnectedToSignallingServer = onConnectedToSignallingServer;
		this.tag = tag;
		this.onLoggedIn = onLoggedIn;
		this.onJoinedRoom = onJoinedRoom;
		this.onPeerJoined = onPeerJoined;
	}

	signallingServerMessageHandler(msg: any) {
		switch (msg.message) {
			case "welcome":
				this.myid = msg.clientid;
				this.ice_servers = msg.ice_servers;
				this.onConnectedToSignallingServer(this.tag);
				this.isConnected = true;
				break;
			case "login-ok":
				this.isLoggedIn = true;
				this.onLoggedIn(this.tag);
				break;

			case "join-ok":
				this.isHost = msg.host;
				this.hostId = msg.hostid;
				this.isOnRoom = true;
				if (!this.isHost) this.onPeerJoinedSGWS(msg.hostId, msg.hostalias);
				else this.onJoinedRoom(this.tag);
				break;

			case "peer-joined":
				this.onPeerJoinedSGWS(msg.clientid, msg.alias);
				break;

			case "offer":
				this.handleOffer(msg.from, msg.offer);
				break;

			case "answer":
				this.handleAnswer(msg.from, msg.answer);
				break;

			case "icecandidate":
				this.handleIceCandidate(msg.from, msg.icecandidate);
				break;
		}
	}

	async connectToSignallingServer(serverUrl: string): Promise<void> {
		if (this.ws) {
			return;
		}

		this.ws = new WebSocket(serverUrl, this.SUBPROTOCOL);

		this.ws.onopen = () => {};

		this.ws.onmessage = (event) => {
			this.signallingServerMessageHandler(JSON.parse(event.data));
		};

		this.ws.onerror = (error) => {
			console.error(`WebSocket error for tag ${this.tag}:`, error);
		};

		this.ws.onclose = () => {
			console.log(`WebSocket connection closed for tag ${this.tag}`);
			this.ws = null; // Reset the WebSocket instance
		};
	}

	async loginToSignallingServer(alias: string): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}
		this.ws.send(
			JSON.stringify({
				message: "login",
				protocolrev: 1,
				datachannelrev: 2,
				compressionformats: ["deflate", "gzip"],
				alias,
			})
		);
	}

	async autoJoinRoom(
		game: string,
		instance: string,
		room: string,
		max_clients: string,
		lock_when_full: boolean
	): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}

		this.sendSgws({
			message: "auto-join",
			game,
			instance,
			room,
			max_clients,
			lock_when_full,
		});
	}

	async joinRoom(
		game: string,
		instance: string,
		room: string,
		max_clients: string
	): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}

		this.sendSgws({
			message: "join",
			game,
			instance,
			room,
			max_clients,
		});
	}

	onPeerJoinedSGWS(peerId: string, peerAlias: string): void {
		const peerConnection: PeerConnectionWrapper = {
			conn: new RTCPeerConnection({ iceServers: this.ice_servers || [] }),
			channels: {
				unorderedReliable: null,
				orderedReliable: null,
				unreliable: null,
			},
			state: "new",
			lastPing: null,
			isReady: false,
			peerId,
			peerAlias,
		};
		this.connectionsWebRTC.set(peerId, peerConnection);
		peerConnection.conn.onicecandidate = (e) => {
			if (e.candidate) {
				this.sendSgws({
					message: "icecandidate",
					toclientid: peerId,
					icecandidate: e.candidate,
				});
			}
		};

		peerConnection.conn.onconnectionstatechange = () => {};
		this.setupDataChannel(peerConnection);

		this.sendQueues.set(
			peerId,
			new ChannelSendQueue(
				peerConnection.channels.orderedReliable!,
				peerId,
				this.tag,
				this.simLatency,
				this.simPdv
			)
		);

		if (this.isHost)
			peerConnection.conn.createOffer().then(async (offer) => {
				return peerConnection.conn.setLocalDescription(offer).then(() => {
					this.sendSgws({
						message: "offer",
						offer,
						toclientid: peerConnection.peerId,
					});
				});
			});
		this.waitForReady(peerConnection).then(() => {
			peerConnection.isReady = true;
			if (this.isHost) {
				this.onPeerJoined(
					peerConnection.peerId,
					peerConnection.peerAlias,
					this.tag
				);
			} else {
				this.onJoinedRoom(this.tag);
			}
		});
	}

	setupDataChannel(peerConnection: PeerConnectionWrapper): void {
		const dc_protocol =
			"C3M_" + this.game + "_" + this.instance + "_" + this.room;

		peerConnection.channels.orderedReliable =
			peerConnection.conn.createDataChannel("ordered-reliable", {
				ordered: true,
				protocol: dc_protocol,
			});

		peerConnection.channels.unorderedReliable =
			peerConnection.conn.createDataChannel("unordered-reliable", {
				ordered: false,
				protocol: dc_protocol,
			});

		peerConnection.channels.unreliable = peerConnection.conn.createDataChannel(
			"unreliable",
			{
				ordered: false,
				maxRetransmits: 0,
				protocol: dc_protocol,
			}
		);
	}

	async handleOffer(
		peerId: string,
		offer: RTCSessionDescriptionInit
	): Promise<void> {
		const peerConnection = this.connectionsWebRTC.get(peerId);
		if (!peerConnection) {
			return;
		}
		await peerConnection.conn.setRemoteDescription(
			new RTCSessionDescription(offer)
		);
		const answer = await peerConnection.conn.createAnswer();
		await peerConnection.conn.setLocalDescription(answer);
		this.sendSgws({
			message: "answer",
			answer,
			toclientid: peerId,
		});
	}

	async handleAnswer(
		peerId: string,
		answer: RTCSessionDescriptionInit
	): Promise<void> {
		const peerConnection = this.connectionsWebRTC.get(peerId);
		if (!peerConnection) {
			return;
		}
		await peerConnection.conn.setRemoteDescription(
			new RTCSessionDescription(answer)
		);
	}

	async handleIceCandidate(
		peerId: string,
		candidate: RTCIceCandidateInit
	): Promise<void> {
		const peerConnection = this.connectionsWebRTC.get(peerId);
		if (!peerConnection) {
			return;
		}
		await peerConnection.conn.addIceCandidate(new RTCIceCandidate(candidate));
	}

	// send a message to the signalling server
	async sendSgws(message: { [key: string]: any }): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}

		this.ws.send(JSON.stringify(message));
	}

	private waitForReady(peerConnection: PeerConnectionWrapper): Promise<void> {
		return new Promise((resolve) => {
			const checkReady = () => {
				const connReady = peerConnection.conn.connectionState === "connected";
				const allChannelsReady = Object.values(peerConnection.channels).every(
					(dc) => !dc || dc.readyState === "open"
				);
				if (connReady && allChannelsReady) {
					resolve();
				}
			};

			peerConnection.conn.onconnectionstatechange = checkReady;

			for (const dc of Object.values(peerConnection.channels)) {
				if (dc) dc.onopen = checkReady;
			}
		});
	}

	sendMessageToPeer(
		peerId: string,
		message: string,
		channel: "unorderedReliable" | "orderedReliable" | "unreliable"
	): void {
		if (peerId === "" && this.isHost) return;
		else if (peerId === "" && !this.isHost) peerId = this.hostId!;

		const peerConnection = this.connectionsWebRTC.get(peerId);
		if (!peerConnection) return;

		const datachannel = peerConnection.channels[channel];
		if (!datachannel || datachannel.readyState !== "open") return;

		// Simular pérdida
		if (this.simPacketLoss > 0 && Math.random() < this.simPacketLoss / 100) {
			console.warn(`[${this.tag}] Paquete perdido simulado para ${peerId}`);
			return;
		}

		if (channel === "orderedReliable") {
			const queueMap = this.sendQueues.get(peerId);
			if (queueMap) {
				queueMap.enqueue(message);
				return;
			}
		}

		// Unordered: delay directo
		const jitter = Math.random() * this.simPdv * 2 - this.simPdv;
		const delay = Math.max(0, this.simLatency + jitter);

		setTimeout(() => {
			try {
				datachannel.send(message);
			} catch (e) {
				console.error(`[${this.tag}] Error enviando a ${peerId}:`, e);
			}
		}, delay);
	}

	broadcastMessageToPeers(
		fromId: string,
		message: string,
		channel: "unorderedReliable" | "orderedReliable" | "unreliable"
	): void {
		for (const [peerId, _] of this.connectionsWebRTC.entries()) {
			if (peerId === fromId) continue;
			this.sendMessageToPeer(peerId, message, channel);
		}
	}
}

export class WebRTC {
	public clients: Map<string, ClientWebRTC>;

	constructor() {
		this.clients = new Map();
	}

	async connectToSignallingServer(
		serverUrl: string,
		tag: string
	): Promise<void> {
		const client =
			this.clients.get(tag) ||
			new ClientWebRTC(
				tag,
				this.onConnectedToSignallingServer,
				this.onLoggedIn,
				this.onJoinedRoom,
				this.onPeerJoined
			); // Create a new client if it doesn't exist
		this.clients.set(tag, client);
		await client.connectToSignallingServer(serverUrl);
	}

	onConnectedToSignallingServer(tag: string) {
		this.clients.get(tag);
	}
	onLoggedIn(tag: string) {
		this.clients.get(tag);
	}
	onJoinedRoom(tag: string) {
		this.clients.get(tag);
	}
	onPeerJoined(peerId: string, peerAlias: string, tag: string) {
		this.clients.get(tag);
	}
}
