"use strict";
const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";
class WebRTCDOMHandler extends globalThis.DOMHandler {
    _instanceWebRTC = new self.WebRTC(); // Instancia de WebRTC para manejar la lógica de WebRTC
    constructor(iRuntime) {
        super(iRuntime, DOM_COMPONENT_ID);
        this.AddRuntimeMessageHandlers([
            ["connect", (data) => this._handleConnect(data)],
            ["login", (data) => this._handleLogin(data)],
            ["joinRoom", (data) => this._handleJoinRoom(data)],
            ["autoJoinRoom", (data) => this._handleAutoJoinRoom(data)],
            ["sendPeerMessage", (data) => this._handleSendPeerMessage(data)],
        ]);
        this._instanceWebRTC.onConnectedToSgWsCallback = (tag) => {
            const client = this._instanceWebRTC.clients.get(tag);
            if (client) {
                this.PostToRuntime("onConnectedToSgWs", {
                    tag,
                    client: client.toSerializable(),
                });
            }
        };
        this._instanceWebRTC.onLoggedInCallback = (tag) => {
            const client = this._instanceWebRTC.clients.get(tag);
            if (client) {
                this.PostToRuntime("onLoggedIn", {
                    tag,
                    client: client.toSerializable(),
                });
            }
        };
        this._instanceWebRTC.onJoinedRoomCallback = (tag) => {
            const client = this._instanceWebRTC.clients.get(tag);
            if (client) {
                this.PostToRuntime("onJoinedRoom", {
                    tag,
                    client: client.toSerializable(),
                });
            }
        };
        this._instanceWebRTC.onPeerConnectedCallback = (tag, peerId, peerAlias) => {
            this.PostToRuntime("onPeerConnected", { tag, peerId, peerAlias });
        };
        this._instanceWebRTC.onPeerMessageCallback = (peerId, clientTag, message, tag) => {
            this.PostToRuntime("onPeerMessage", {
                peerId,
                clientTag,
                message,
                tag,
            });
        };
    }
    _handleConnect(data) {
        const { url, tag } = data;
        this._instanceWebRTC.connectToSignallingServer(url, tag);
    }
    _handleLogin(data) {
        const { alias, tag } = data;
        this._instanceWebRTC.clients.get(tag)?.loginToSignallingServer(alias);
    }
    _handleJoinRoom(data) {
        const { game, instance, room, tag, maxPeers } = data;
        this._instanceWebRTC.clients
            .get(tag)
            ?.joinRoom(game, instance, room, maxPeers);
    }
    _handleAutoJoinRoom(data) {
        const { game, instance, room, tag, maxPeers, locking } = data;
        this._instanceWebRTC.clients
            .get(tag)
            ?.autoJoinRoom(game, instance, room, maxPeers, locking);
    }
    _handleSendPeerMessage(data) {
        const { peerId, clientTag, message, mode } = data;
        this._instanceWebRTC.clients
            .get(clientTag)
            ?.sendMessageToPeer(peerId, message, mode);
    }
}
globalThis.RuntimeInterface.AddDOMHandlerClass(WebRTCDOMHandler);
