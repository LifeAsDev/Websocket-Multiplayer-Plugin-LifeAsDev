const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";

class WebRTCDOMHandler extends globalThis.DOMHandler {
	_instanceWebRTC = new self.WebRTC();
	/*  */
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
			[
				"leaveRoomOnSignalling",
				(data) => this._handleLeaveRoomOnSignalling(data),
			],
			["kickPeer", (data) => this._handleKickPeer(data)],
			["requestListRoom", (data) => this._handleRequestListRoom(data)],
			["requestListInstance", (data) => this._handleRequestListInstance(data)],
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
					client.peerCount = 1;

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
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					client.peerCount++;
					this.PostToRuntime("onPeerConnected", {
						clientTag: data.clientTag,
						peerId: data.peerId,
						peerAlias: data.peerAlias,
						client: client.toSerializable(),
					});
				}
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
					client.peerCount--;
					this.PostToRuntime("onPeerDisconnected", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
						peerAlias: data.peerAlias,
						peerId: data.peerId,
					});
				}
			}
		);
		this._instanceWebRTC.eventManager.on(
			"leftRoom",
			(data: { clientTag: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);

				if (client) {
					this.PostToRuntime("leftRoom", {
						clientTag: data.clientTag,
					});
				}
			}
		);
		this._instanceWebRTC.eventManager.on(
			"onKicked",
			(data: { clientTag: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);

				if (client) {
					this.PostToRuntime("onKicked", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
					});
				}
			}
		);
		this._instanceWebRTC.eventManager.on(
			"onError",
			(data: { clientTag: string; errorMessage: string }) => {
				const client = this._instanceWebRTC.clients.get(data.clientTag);
				if (client) {
					this.PostToRuntime("onError", {
						clientTag: data.clientTag,
						client: client.toSerializable(),
						errorMessage: data.errorMessage,
					});
				}
			}
		);
		this._instanceWebRTC.eventManager.on(
			"room-list",
			(data: { clientTag: string; roomListData: any }) => {
				this.PostToRuntime("onRoomList", {
					clientTag: data.clientTag,
					roomListData: data.roomListData,
				});
			}
		);
		this._instanceWebRTC.eventManager.on(
			"instance-list",
			(data: { clientTag: string; instanceListData: any }) => {
				this.PostToRuntime("onInstanceList", {
					clienTag: data.clientTag,
					instanceListData: data.instanceListData,
				});
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
	_handleLeaveRoomOnSignalling(data: JSONValue): void {
		const { clientTag } = data as { clientTag: string };
		this._instanceWebRTC.clients.get(clientTag)?.leaveRoomOnSignalling();
	}
	_handleKickPeer(data: JSONValue): void {
		const { clientTag, peerId, reason } = data as {
			clientTag: string;
			peerId: string;
			reason: string;
		};
		this._instanceWebRTC.clients.get(clientTag)?.kickPeer(peerId, reason);
	}
	_handleRequestListRoom(data: JSONValue): void {
		const { clientTag, game, instance, which } = data as {
			clientTag: string;
			game: string;
			instance: string;
			which: number;
		};

		this._instanceWebRTC.clients
			.get(clientTag)
			?.requestRoomList(game, instance, which);
	}
	_handleRequestListInstance(data: JSONValue): void {
		const { clientTag, game } = data as {
			clientTag: string;
			game: string;
		};

		this._instanceWebRTC.clients.get(clientTag)?.requestInstanceList(game);
	}
}

globalThis.RuntimeInterface.AddDOMHandlerClass(WebRTCDOMHandler);
