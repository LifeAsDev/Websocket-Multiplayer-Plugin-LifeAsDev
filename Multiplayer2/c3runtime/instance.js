import { WebRTC } from "./workerside/webrtc.js";
const C3 = globalThis.C3;
const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";
class SingleGlobalInstance extends globalThis.ISDKInstanceBase {
    /* _testProperty: number;
     */
    clients = new Map();
    clientTag = "";
    msgTag = "";
    msg = "";
    peerId = "";
    peerAlias = "";
    constructor() {
        super({ domComponentId: DOM_COMPONENT_ID });
        // Initialise object properties
        /* 	this._testProperty = 0; */
        this._addDOMMessageHandlers([
            ["onConnectedToSgWs", (msg) => this._onConnectedToSgWs(msg)],
            ["onLoggedIn", (msg) => this._onLoggedIn(msg)],
            ["onJoinedRoom", (msg) => this._onJoinedRoom(msg)],
            ["onPeerConnected", (msg) => this._onPeerConnected(msg)],
            ["onPeerMessage", (msg) => this._onPeerMessage(msg)],
            [
                "onDisconnectedFromSignalling",
                (msg) => this._onDisconnectedFromSignalling(msg),
            ],
            ["onPeerDisconnected", (msg) => this._onPeerDisconnected(msg)],
            ["leftRoom", (msg) => this._onLeftRoom(msg)],
            ["onKicked", (msg) => this._onKickedRoom(msg)],
        ]);
        const properties = this._getInitProperties();
        if (properties) {
            // note properties may be null in some cases
            /* this._testProperty = properties[0] as number; */
        }
    }
    _onConnectedToSgWs(msg) {
        const { clientTag, client } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onConnectedToSgWs);
    }
    _onLoggedIn(msg) {
        const { clientTag, client, alias } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this.peerAlias = alias;
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLoggedInToSgWs);
    }
    _onJoinedRoom(msg) {
        const { clientTag, client } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onJoinedRoom);
    }
    _onPeerConnected(msg) {
        const { clientTag, peerId, peerAlias } = msg;
        this.clientTag = clientTag;
        this.peerId = peerId;
        this.peerAlias = peerAlias;
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerConnected);
    }
    _onPeerMessage(msg) {
        const { peerId, clientTag, message, tag, peerAlias } = msg;
        this.clientTag = clientTag;
        this.peerId = peerId;
        this.peerAlias = peerAlias;
        this.msgTag = tag;
        this.msg = message;
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerMessage);
    }
    _onDisconnectedFromSignalling(msg) {
        const { clientTag, client } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onDisconnectedFromSignalling);
    }
    _onPeerDisconnected(msg) {
        const { clientTag, client, peerId, peerAlias } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this.peerId = peerId;
        this.peerAlias = peerAlias;
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerDisconnected);
    }
    _onLeftRoom(msg) {
        const { clientTag, client } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLeftRoom);
    }
    _onKickedRoom(msg) {
        const { clientTag, client } = msg;
        this.clientTag = clientTag;
        this.clients.set(clientTag, client);
        this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onKicked);
    }
    _release() {
        super._release();
    }
    /* _setTestProperty(n: number) {
        this._testProperty = n;
    }

    _getTestProperty() {
        return this._testProperty;
    }
 */
    _saveToJson() {
        return {
        // data to be saved for savegames
        };
    }
    _loadFromJson(o) {
        // load state for savegames
    }
}
C3.Plugins.Lifeasdev_MultiplayerPlugin.Instance = SingleGlobalInstance;
