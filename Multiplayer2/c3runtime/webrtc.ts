import type {
	OnPeerMessageCallback,
	TagCallback,
	PeerConnectionWrapper,
} from "./webrtcTypes";

class EventManager {
	private events: Map<string, Function[]> = new Map();

	on(event: string, callback: Function): void {
		if (!this.events.has(event)) {
			this.events.set(event, []);
		}
		this.events.get(event)?.push(callback);
	}

	emit(event: string, ...args: any[]): void {
		const callbacks = this.events.get(event);
		if (callbacks) {
			callbacks.forEach((callback) => callback(...args));
		}
	}

	off(event: string, callback: Function): void {
		const callbacks = this.events.get(event);
		if (callbacks) {
			this.events.set(
				event,
				callbacks.filter((cb) => cb !== callback)
			);
		}
	}
}

class ClientWebRTC {
	ChannelSendQueue = self.ChannelSendQueue;
	private eventManager: EventManager;
	public tag: string;
	public ws: WebSocket | null = null;
	private SUBPROTOCOL: string = "c2multiplayer";
	public isLoggedIn: boolean = false;
	public isConnected: boolean = false;
	public isHost: boolean = false;
	public myid: string = "";
	public myAlias: string = "";
	public hostId: string = "";
	public hostAlias: string = "";
	public game: string = "";
	public instance: string = "";
	public room: string = "";
	public isOnRoom: boolean = false;
	public connectionsWebRTC: Map<string, PeerConnectionWrapper> = new Map();
	public ice_servers: RTCIceServer[] = [];
	public simLatency: number = 0;
	public simPdv: number = 0;
	public simPacketLoss: number = 0;
	public sendQueues: Map<string, any> = new Map();

	constructor(tag: string, eventManager: EventManager) {
		this.tag = tag;
		this.eventManager = eventManager;
	}
	broadcastPeerConnected(peerId: string, peerAlias: string) {
		const message = JSON.stringify({
			type: "peer-connected",
			peerId,
			peerAlias,
		});
		this.broadcastMessageToPeers(peerId, message, "unorderedReliable");
	}

	sendPeerConnecteds(peerId: string) {
		const peers: { peerId: string; alias: string }[] = [];

		peers.push({ peerId: this.hostId, alias: this.hostAlias });

		for (const [id, conn] of this.connectionsWebRTC.entries()) {
			peers.push({ peerId: id, alias: conn.peerAlias });
		}

		const message = JSON.stringify({
			type: "peer-connecteds-list",
			peers,
		});

		this.sendMessageToPeer(peerId, message, "unorderedReliable");
	}

	signallingServerMessageHandler(msg: any) {
		switch (msg.message) {
			case "welcome":
				this.myid = msg.clientid;
				let rawIceServers: any[] = msg.ice_servers || [];

				this.ice_servers = rawIceServers.map((server): RTCIceServer => {
					if (typeof server === "string") {
						return { urls: server };
					}
					return server as RTCIceServer;
				});
				this.eventManager.emit("connected", {
					clientTag: this.tag,
				});
				this.isConnected = true;
				break;
			case "login-ok":
				this.isLoggedIn = true;
				this.myAlias = msg.alias;

				this.eventManager.emit("loggedIn", {
					clientTag: this.tag,
					alias: msg.alias,
				});
				break;

			case "join-ok":
				this.isHost = msg.host;
				this.hostId = msg.hostid;
				this.hostAlias = msg.hostalias;
				this.isOnRoom = true;
				if (this.isHost) {
					this.hostId = this.myid;
					this.hostAlias = this.myAlias;
					this.eventManager.emit("joinedRoom", {
						clientTag: this.tag,
					});
				}
				break;

			case "peer-joined":
				this.onPeerJoinedSGWS(msg.peerid, msg.peeralias);
				break;

			case "offer":
				this.onPeerJoinedSGWS(msg.from, this.hostAlias!);

				this.handleOffer(msg.from, msg.offer);
				break;

			case "answer":
				this.handleAnswer(msg.from, msg.answer);
				break;

			case "icecandidate":
				this.handleIceCandidate(msg.from, msg.icecandidate);
				break;
			case "kicked":
				if (msg.reason === "host-left") this.disconnectFromSignalling();
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
			this.isConnected = false;
			this.isLoggedIn = false;
			this.ws = null;
			this.eventManager.emit("disconnected", {
				clientTag: this.tag,
			});
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
		max_clients: number,
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
		max_clients: number
	): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}
		this.game = game;
		this.instance = instance;
		this.room = room;
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
		if (this.isHost) {
			this.setupDataChannel(peerConnection);
		} else {
			let channelsReady = 0;
			const expectedChannels = 3;

			peerConnection.conn.ondatachannel = (event) => {
				const dc = event.channel;

				if (dc.label === "ordered-reliable") {
					peerConnection.channels.orderedReliable = dc;
				} else if (dc.label === "unordered-reliable") {
					peerConnection.channels.unorderedReliable = dc;
				} else if (dc.label === "unreliable") {
					peerConnection.channels.unreliable = dc;
				} else {
					console.warn(`[${this.tag}] Canal desconocido: ${dc.label}`);
					return;
				}

				dc.onmessage = (e) => {
					this.onPeerMessageReceived(
						peerConnection.peerId,
						e.data,
						peerConnection.peerAlias
					);
				};

				dc.onopen = () => {
					channelsReady++;
					if (channelsReady === expectedChannels) {
						peerConnection.isReady = true;

						this.sendQueues.set(
							peerId,
							new self.ChannelSendQueue(
								peerConnection.channels.orderedReliable!,
								peerId,
								this.tag
							)
						);

						this.eventManager.emit("joinedRoom", {
							clientTag: this.tag,
						});
					}
				};
			};
		}

		if (this.isHost) {
			this.sendQueues.set(
				peerId,
				new self.ChannelSendQueue(
					peerConnection.channels.orderedReliable!,
					peerId,
					this.tag
				)
			);
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

				this.eventManager.emit("peerJoined", {
					peerId: peerConnection.peerId,
					clientTag: this.tag,
					peerAlias: peerConnection.peerAlias,
				});
				if (this.isHost) {
					this.sendPeerConnecteds(peerConnection.peerId);
					this.broadcastPeerConnected(
						peerConnection.peerId,
						peerConnection.peerAlias
					);
				}
				this.sendSgws({
					message: "confirm-peer",
					id: peerConnection.peerId,
				});
			});
		}
	}

	setupDataChannel(peerConnection: PeerConnectionWrapper): void {
		const dc_protocol =
			"C3M_" + this.game + "_" + this.instance + "_" + this.room;

		const assignOnMessage = (dc: RTCDataChannel | null) => {
			if (!dc) return;
			dc.onmessage = (e) => {
				this.onPeerMessageReceived(
					peerConnection.peerId,
					e.data,
					peerConnection.peerAlias
				);
			};
		};

		peerConnection.channels.orderedReliable =
			peerConnection.conn.createDataChannel("ordered-reliable", {
				ordered: true,
				protocol: dc_protocol,
			});
		assignOnMessage(peerConnection.channels.orderedReliable);

		peerConnection.channels.unorderedReliable =
			peerConnection.conn.createDataChannel("unordered-reliable", {
				ordered: false,
				protocol: dc_protocol,
			});
		assignOnMessage(peerConnection.channels.unorderedReliable);

		peerConnection.channels.unreliable = peerConnection.conn.createDataChannel(
			"unreliable",
			{
				ordered: false,
				maxRetransmits: 0,
				protocol: dc_protocol,
			}
		);
		assignOnMessage(peerConnection.channels.unreliable);
	}

	async handleOffer(
		peerId: string,
		offer: RTCSessionDescriptionInit
	): Promise<void> {
		const peerConnection = this.connectionsWebRTC.get(peerId);
		if (!peerConnection) {
			console.warn(`[${this.tag}] Peer connection not found for ${peerId}`);
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
					(dc) => dc && dc.readyState === "open"
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

		if (
			channel === "unreliable" &&
			this.simPacketLoss > 0 &&
			Math.random() < this.simPacketLoss / 100
		) {
			return;
		}

		let delayMultiplier = 1;
		if (
			channel !== "unreliable" &&
			this.simPacketLoss > 0 &&
			Math.random() < this.simPacketLoss / 100
		) {
			delayMultiplier = 3;
		}

		const jitter = Math.random() * this.simPdv * 2 - this.simPdv;
		const delay = Math.max(0, (this.simLatency + jitter) * delayMultiplier);

		if (channel === "orderedReliable") {
			const queueMap = this.sendQueues.get(peerId);
			if (queueMap) {
				queueMap.enqueue(message, delay);
				return;
			}
		}

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

	onPeerMessageReceived = (
		peerId: string,
		message: string,
		peerAlias: string
	) => {
		const parsedMessage = JSON.parse(message);
		switch (parsedMessage.type) {
			case "default":
				this.eventManager.emit("peerMessage", {
					peerId: peerId,
					message: parsedMessage.message,
					clientTag: this.tag,
					peerAlias,
					tag: parsedMessage.tag,
				});

				break;

			case "peer-connected":
				this.eventManager.emit("peerJoined", {
					peerId: parsedMessage.peerId,
					clientTag: this.tag,
					peerAlias: parsedMessage.peerAlias,
				});
				break;

			case "peer-connecteds-list":
				for (const p of parsedMessage.peers) {
					if (p.peerId === this.myid) continue;
					this.eventManager.emit("peerJoined", {
						peerId: p.peerId,
						clientTag: this.tag,
						peerAlias: p.peerAlias,
					});
				}
				break;
		}
	};

	toSerializable() {
		return {
			tag: this.tag,
			isLoggedIn: this.isLoggedIn,
			isConnected: this.isConnected,
			isHost: this.isHost,
			myid: this.myid,
			myAlias: this.myAlias,
			hostId: this.hostId,
			hostAlias: this.hostAlias,
			game: this.game,
			instance: this.instance,
			room: this.room,
			isOnRoom: this.isOnRoom,
			ice_servers: this.ice_servers.map((s) => ({
				urls: s.urls,
				username: s.username ?? null,
				credential: s.credential ?? null,
			})),
			simLatency: this.simLatency,
			simPdv: this.simPdv,
			simPacketLoss: this.simPacketLoss,
		};
	}
	disconnectFromSignalling = () => {
		if (this.ws) {
			this.isConnected = false;
			this.isLoggedIn = false;
			this.ws.close();
		}
	};
}

class WebRTC {
	public eventManager: EventManager;
	public clients: Map<string, ClientWebRTC>;

	constructor() {
		this.eventManager = new EventManager();
		this.clients = new Map();
	}

	connectToSignallingServer(serverUrl: string, tag: string): void {
		let client = this.clients.get(tag);
		if (!client) {
			client = new ClientWebRTC(tag, this.eventManager);
			this.clients.set(tag, client);
		}
		client.connectToSignallingServer(serverUrl);
	}
}

self.WebRTC = WebRTC;
declare global {
	interface Window {
		WebRTC: typeof WebRTC;
	}
}
self.WebRTC = WebRTC;
