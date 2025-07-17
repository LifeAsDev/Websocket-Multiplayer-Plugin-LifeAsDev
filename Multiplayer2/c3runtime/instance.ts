import type { ClientSerializable } from "./webrtcTypes.js";
import { WebRTC } from "./workerside/webrtc.js";

const C3 = globalThis.C3;
const DOM_COMPONENT_ID = "LifeAsDevWebRTC_DOMMessaging";

class SingleGlobalInstance extends globalThis.ISDKInstanceBase {
	/* _testProperty: number;
	 */
	clients: Map<string, ClientSerializable> = new Map();
	clientTag: string = "";
	msgTag: string = "";
	msg: string = "";
	peerId: string = "";
	peerAlias: string = "";

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
		]);

		const properties = this._getInitProperties();
		if (properties) {
			// note properties may be null in some cases
			/* this._testProperty = properties[0] as number; */
		}
	}
	_onConnectedToSgWs(msg: any): void {
		const { tag, client } = msg;
		this.clientTag = tag;
		this.clients.set(tag, client);

		this._trigger(
			C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onConnectedToSgWs
		);
	}

	_onLoggedIn(msg: any): void {
		const { tag, client } = msg;
		this.clientTag = tag;
		this.clients.set(tag, client);
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLoggedInToSgWs);
	}

	_onJoinedRoom(msg: any): void {
		const { tag, client } = msg;
		this.clientTag = tag;
		this.clients.set(tag, client);
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onJoinedRoom);
	}

	_onPeerConnected(msg: any): void {
		const { tag, peerId, peerAlias } = msg;
		this.clientTag = tag;
		this.peerId = peerId;
		this.peerAlias = peerAlias;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerConnected);
	}

	_onPeerMessage(msg: any): void {
		const { peerId, clientTag, message, tag, peerAlias } = msg;
		this.clientTag = clientTag;
		this.peerId = peerId;
		this.peerAlias = peerAlias;
		this.msgTag = tag;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerMessage);
	}
	_onDisconnectedFromSignalling(msg: any): void {
		const { clientTag, client } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this._trigger(
			C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onDisconnectedFromSignalling
		);
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

	_loadFromJson(o: any) {
		// load state for savegames
	}
}

C3.Plugins.Lifeasdev_MultiplayerPlugin.Instance = SingleGlobalInstance;

export type { SingleGlobalInstance as SDKInstanceClass };
