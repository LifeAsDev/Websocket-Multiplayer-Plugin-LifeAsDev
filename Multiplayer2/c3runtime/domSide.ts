const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";

class WebRTCDOMHandler extends globalThis.DOMHandler {
	_instanceWebRTC = new self.WebRTC(); // Instancia de WebRTC para manejar la lógica de WebRTC

	constructor(iRuntime: IRuntimeInterface) {
		super(iRuntime, DOM_COMPONENT_ID);

		this.AddRuntimeMessageHandlers([
			["connect", (data) => this._handleConnect(data)],
			["login", (data) => this._handleLogin(data)],
			["joinRoom", (data) => this._handleJoinRoom(data)],
			["autoJoinRoom", (data) => this._handleAutoJoinRoom(data)],
			["sendPeerMessage", (data) => this._handleSendPeerMessage(data)],
			["simulate-latency", (data) => this._handleSimulateLatency(data)],
			["broadcastMessage", (data) => this._handleBroadcastMessage(data)],
			[
				"disconnectFromSignalling",
				(data) => this._handleDisconnectFromSignalling(data),
			],
			["disconnectFromRoom", (data) => this._handleDisconnectFromRoom(data)],
		]);
		this._instanceWebRTC.eventManager.on(
			"connected",
			(data: { clientTag: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onConnectedToSgWs", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
					});
				}
			}
		);

		this._instanceWebRTC.eventManager.on(
			"loggedIn",
			(data: { clientTag: string; alias: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onLoggedIn", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
						alias: data.alias,
					});
				}
			}
		);

		this._instanceWebRTC.eventManager.on(
			"joinedRoom",
			(data: { clientTag: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onJoinedRoom", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
					});
				}
			}
		);

		this._instanceWebRTC.eventManager.on(
			"peerJoined",
			(data: { clientTag: string; peerId: string; peerAlias: string }) => {
				this.PostToRuntime("onPeerConnected", {
					clientTag: data.clientTag,
					peerId: data.peerId,
					peerAlias: data.peerAlias,
				});
			}
		);

		this._instanceWebRTC.eventManager.on(
			"peerMessage",
			(data: {
				peerId: string;
				clientTag: string;
				message: string;
				tag: string;
				peerAlias: string;
			}) => {
				this.PostToRuntime("onPeerMessage", {
					peerId: data.peerId,
					clientTag: data.clientTag,
					message: data.message,
					tag: data.tag,
					peerAlias: data.peerAlias,
				});
			}
		);

		this._instanceWebRTC.eventManager.on(
			"disconnected",
			(data: { clientTag: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onDisconnectedFromSignalling", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
					});
				}
			}
		);
		this._instanceWebRTC.eventManager.on(
			"onPeerDisconnected",
			(data: { clientTag: string; peerId: string; peerAlias: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onPeerDisconnected", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
						peerAlias: data.peerAlias,
						peerId: data.peerId,
					});
				}
			}
		);
	}

	_handleConnect(data: JSONValue): void {
		const { url, tag } = data as { url: string; tag: string };
		this._instanceWebRTC.connectToSignallingServer(url, tag);
	}

	_handleLogin(data: JSONValue): void {
		const { alias, tag } = data as { alias: string; tag: string };
		this._instanceWebRTC.clients.get(tag)?.loginToSignallingServer(alias);
	}

	_handleJoinRoom(data: JSONValue): void {
		const { game, instance, room, tag, maxPeers } = data as {
			game: string;
			instance: string;
			room: string;
			tag: string;
			maxPeers: number;
		};
		this._instanceWebRTC.clients
			.get(tag)
			?.joinRoom(game, instance, room, maxPeers);
	}

	_handleAutoJoinRoom(data: JSONValue): void {
		const { game, instance, room, tag, maxPeers, locking } = data as {
			game: string;
			instance: string;
			room: string;
			tag: string;
			maxPeers: number;
			locking: boolean;
		};
		this._instanceWebRTC.clients
			.get(tag)
			?.autoJoinRoom(game, instance, room, maxPeers, locking);
	}

	_handleSendPeerMessage(data: JSONValue): void {
		const { peerId, clientTag, message, mode } = data as {
			peerId: string;
			clientTag: string;
			message: string;
			mode: "unorderedReliable" | "orderedReliable" | "unreliable";
		};
		this._instanceWebRTC.clients
			.get(clientTag)
			?.sendMessageToPeer(peerId, message, mode);
	}
	_handleSimulateLatency(data: JSONValue): void {
		const { clientTag, latency, pdv, loss } = data as {
			clientTag: string;
			latency: number;
			pdv: number;
			loss: number;
		};

		const client = this._instanceWebRTC.clients.get(clientTag);
		if (!client) {
			return;
		}

		client.simLatency = latency;
		client.simPdv = pdv;
		client.simPacketLoss = loss;
	}
	_handleBroadcastMessage(data: JSONValue): void {
		const { peerId, clientTag, message, mode } = data as {
			peerId: string;
			clientTag: string;
			message: string;
			mode: "unorderedReliable" | "orderedReliable" | "unreliable";
		};
		this._instanceWebRTC.clients
			.get(clientTag)
			?.broadcastMessageToPeers(peerId, message, mode);
	}
	_handleDisconnectFromSignalling(data: JSONValue): void {
		const { clientTag } = data as { clientTag: string };
		this._instanceWebRTC.clients.get(clientTag)?.disconnectFromSignalling();
	}
	_handleDisconnectFromRoom(data: JSONValue): void {
		const { clientTag } = data as { clientTag: string };
		this._instanceWebRTC.clients.get(clientTag)?.disconnectFromRoom();
	}
}

globalThis.RuntimeInterface.AddDOMHandlerClass(WebRTCDOMHandler);
