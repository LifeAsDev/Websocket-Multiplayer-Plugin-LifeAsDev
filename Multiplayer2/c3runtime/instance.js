import { WebRTC } from "./webrtc.js";
const C3 = globalThis.C3;
class SingleGlobalInstance extends globalThis.ISDKInstanceBase {
    constructor() {
        super();
        /* _testProperty: number;
         */
        this._instanceWebRTC = new WebRTC();
        this.clientTag = "";
        this.msgTag = "";
        this.msg = "";
        this.peerId = "";
        this._instanceWebRTC.onConnectedToSgWsCallback = (tag) => {
            this.clientTag = tag;
            this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onConnectedToSgWs);
        };
        this._instanceWebRTC.onLoggedInCallback = (tag) => {
            this.clientTag = tag;
            this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLoggedInToSgWs);
        };
        this._instanceWebRTC.onJoinedRoomCallback = (tag) => {
            this.clientTag = tag;
            this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onJoinedRoom);
        };
        this._instanceWebRTC.onPeerMessageCallback = (peerId, clientTag, message, tag) => {
            this.msgTag = tag;
            this.msg = message;
            this.clientTag = clientTag;
            this.peerId = peerId;
            this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerMessage);
        };
        // Initialise object properties
        /* 	this._testProperty = 0; */
        const properties = this._getInitProperties();
        if (properties) {
            // note properties may be null in some cases
            /* this._testProperty = properties[0] as number; */
        }
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
