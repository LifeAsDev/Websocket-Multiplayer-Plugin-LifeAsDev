"use strict";
const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";
class WebRTCDOMHandler extends globalThis.DOMHandler {
    _instanceWebRTC = new self.WebRTC();
    /*  */
    constructor(iRuntime) {
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
        this._instanceWebRTC.eventManager.on("connected", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("onConnectedToSgWs", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                });
            }
        });
        this._instanceWebRTC.eventManager.on("loggedIn", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("onLoggedIn", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                    alias: data.alias,
                });
            }
        });
        this._instanceWebRTC.eventManager.on("joinedRoom", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                client.peerCount = 1;
                client.peersList = [
                    { peerId: client.myid, peerAlias: client.myAlias },
                ];
                this.PostToRuntime("onJoinedRoom", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                });
            }
        });
        this._instanceWebRTC.eventManager.on("peerJoined", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                const alreadyExists = client.peersList.some((peer) => peer.peerId === data.peerId);
                console.log("peerJoined", data, client.peersList);
                if (!alreadyExists) {
                    client.peerCount++;
                    client.peersList.push({
                        peerId: data.peerId,
                        peerAlias: data.peerAlias,
                    });
                    this.PostToRuntime("onPeerConnected", {
                        clientTag: data.clientTag,
                        peerId: data.peerId,
                        peerAlias: data.peerAlias,
                        client: client.toSerializable(),
                    });
                }
            }
        });
        this._instanceWebRTC.eventManager.on("peerMessage", (data) => {
            this.PostToRuntime("onPeerMessage", {
                peerId: data.peerId,
                clientTag: data.clientTag,
                message: data.message,
                tag: data.tag,
                peerAlias: data.peerAlias,
            });
        });
        this._instanceWebRTC.eventManager.on("disconnected", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("onDisconnectedFromSignalling", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                });
            }
        });
        this._instanceWebRTC.eventManager.on("onPeerDisconnected", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                client.peerCount--;
                client.peersList = client.peersList.filter((peer) => peer.peerId !== data.peerId);
                this.PostToRuntime("onPeerDisconnected", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                    peerAlias: data.peerAlias,
                    peerId: data.peerId,
                });
            }
        });
        this._instanceWebRTC.eventManager.on("leftRoom", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("leftRoom", {
                    clientTag: data.clientTag,
                });
            }
        });
        this._instanceWebRTC.eventManager.on("onKicked", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("onKicked", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                });
            }
        });
        this._instanceWebRTC.eventManager.on("onError", (data) => {
            const client = this._instanceWebRTC.clients.get(data.clientTag);
            if (client) {
                this.PostToRuntime("onError", {
                    clientTag: data.clientTag,
                    client: client.toSerializable(),
                    errorMessage: data.errorMessage,
                });
            }
        });
        this._instanceWebRTC.eventManager.on("room-list", (data) => {
            this.PostToRuntime("onRoomList", {
                clientTag: data.clientTag,
                roomListData: data.roomListData,
            });
        });
        this._instanceWebRTC.eventManager.on("instance-list", (data) => {
            this.PostToRuntime("onInstanceList", {
                clienTag: data.clientTag,
                instanceListData: data.instanceListData,
            });
        });
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
    _handleSimulateLatency(data) {
        const { clientTag, latency, pdv, loss } = data;
        const client = this._instanceWebRTC.clients.get(clientTag);
        if (!client) {
            return;
        }
        client.simLatency = latency;
        client.simPdv = pdv;
        client.simPacketLoss = loss;
    }
    _handleBroadcastMessage(data) {
        const { peerId, clientTag, message, mode } = data;
        this._instanceWebRTC.clients
            .get(clientTag)
            ?.broadcastMessageToPeers(peerId, message, mode);
    }
    _handleDisconnectFromSignalling(data) {
        const { clientTag } = data;
        this._instanceWebRTC.clients.get(clientTag)?.disconnectFromSignalling();
    }
    _handleDisconnectFromRoom(data) {
        const { clientTag } = data;
        this._instanceWebRTC.clients.get(clientTag)?.disconnectFromRoom();
    }
    _handleLeaveRoomOnSignalling(data) {
        const { clientTag } = data;
        this._instanceWebRTC.clients.get(clientTag)?.leaveRoomOnSignalling();
    }
    _handleKickPeer(data) {
        const { clientTag, peerId, reason } = data;
        this._instanceWebRTC.clients.get(clientTag)?.kickPeer(peerId, reason);
    }
    _handleRequestListRoom(data) {
        const { clientTag, game, instance, which } = data;
        this._instanceWebRTC.clients
            .get(clientTag)
            ?.requestRoomList(game, instance, which);
    }
    _handleRequestListInstance(data) {
        const { clientTag, game } = data;
        this._instanceWebRTC.clients.get(clientTag)?.requestInstanceList(game);
    }
}
globalThis.RuntimeInterface.AddDOMHandlerClass(WebRTCDOMHandler);
