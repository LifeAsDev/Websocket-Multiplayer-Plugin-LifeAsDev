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
		]);

		this._instanceWebRTC.onConnectedToSgWsCallback = (tag: string) => {
			const client = this._instanceWebRTC.clients.get(tag);
			if (client) {
				this.PostToRuntime("onConnectedToSgWs", {
					tag,
					client: client.toSerializable(),
				});
			}
		};

		this._instanceWebRTC.onLoggedInCallback = (tag: string) => {
			const client = this._instanceWebRTC.clients.get(tag);
			if (client) {
				this.PostToRuntime("onLoggedIn", {
					tag,
					client: client.toSerializable(),
				});
			}
		};

		this._instanceWebRTC.onJoinedRoomCallback = (tag: string) => {
			const client = this._instanceWebRTC.clients.get(tag);
			if (client) {
				this.PostToRuntime("onJoinedRoom", {
					tag,
					client: client.toSerializable(),
				});
			}
		};

		this._instanceWebRTC.onPeerConnectedCallback = (
			tag: string,
			peerId: string,
			peerAlias: string
		) => {
			this.PostToRuntime("onPeerConnected", { tag, peerId, peerAlias });
		};

		this._instanceWebRTC.onPeerMessageCallback = (
			peerId: string,
			clientTag: string,
			message: string,
			tag: string,
			peerAlias: string
		) => {
			this.PostToRuntime("onPeerMessage", {
				peerId,
				clientTag,
				message,
				tag,
				peerAlias,
			});
		};
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
}

globalThis.RuntimeInterface.AddDOMHandlerClass(WebRTCDOMHandler);
