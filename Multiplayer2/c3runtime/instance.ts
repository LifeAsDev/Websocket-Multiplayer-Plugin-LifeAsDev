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
	errorMessage: string = "";
	roomListData: Array<{
		maxpeercount: number;
		name: string;
		peercount: number;
		state: string;
	}> = [];
	instanceListData: Array<{
		name: string;
		peercount: number;
	}> = [];
	_wakerWorker: Worker | null = null;
	currentClientTag: string = "";
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
			["onError", (msg) => this._onErrorSignalling(msg)],
			["onRoomList", (msg) => this._onRoomList(msg)],
			["onInstanceList", (msg) => this._onInstanceList(msg)],
		]);

		const properties = this._getInitProperties();
		if (properties) {
			// note properties may be null in some cases
			/* this._testProperty = properties[0] as number; */
		}
		this._InitWakerWorker();
	}
	async _InitWakerWorker() {
		this._wakerWorker = new Worker("./waker.js", {
			type: "module",
			name: "MultiplayerWaker2",
		});
		// Suponiendo que 'runtime' es el objeto que emite esos eventos
		this.runtime.addEventListener("suspend", () => {
			this._OnSuspend();
		});

		this.runtime.addEventListener("resume", () => {
			this._OnResume();
		});
		this._wakerWorker.onerror = (e) => {
			console.error("ErrorEvent :", e);
		};
		this._wakerWorker.onmessage = (e) => {
			if (e.data === "tick" && this.runtime.isSuspended) {
				performance.now();
			}
		};
		this._wakerWorker.postMessage("");
	}
	_OnSuspend() {
		this._wakerWorker && this._wakerWorker.postMessage("start");
	}
	_OnResume() {
		this._wakerWorker && this._wakerWorker.postMessage("stop");
	}
	_onConnectedToSgWs(msg: any): void {
		const { clientTag, client } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this._trigger(
			C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onConnectedToSgWs
		);
	}

	_onLoggedIn(msg: any): void {
		const { clientTag, client, alias } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this.peerAlias = alias;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLoggedInToSgWs);
	}

	_onJoinedRoom(msg: any): void {
		const { clientTag, client } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onJoinedRoom);
	}

	_onPeerConnected(msg: any): void {
		const { clientTag, peerId, peerAlias, client } = msg;
		this.clientTag = clientTag;
		this.peerId = peerId;
		this.peerAlias = peerAlias;
		this.clients.set(clientTag, client);

		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerConnected);
	}

	_onPeerMessage(msg: any): void {
		const { peerId, clientTag, message, tag, peerAlias } = msg;
		this.clientTag = clientTag;
		this.peerId = peerId;
		this.peerAlias = peerAlias;
		this.msgTag = tag;
		this.msg = message;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onAnyPeerMessage);
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
	_onPeerDisconnected(msg: any): void {
		const { clientTag, client, peerId, peerAlias } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this.peerId = peerId;
		this.peerAlias = peerAlias;
		this._trigger(
			C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onPeerDisconnected
		);
	}
	_onLeftRoom(msg: any): void {
		const { clientTag, client } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onLeftRoom);
	}
	_onKickedRoom(msg: any): void {
		const { clientTag, client } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onKicked);
	}
	_onErrorSignalling(msg: any): void {
		const { clientTag, client, errorMessage } = msg;
		this.clientTag = clientTag;
		this.clients.set(clientTag, client);
		this.errorMessage = errorMessage;

		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onError);
	}
	_onRoomList(msg: any): void {
		const { clientTag, roomListData } = msg;
		this.clientTag = clientTag;
		this.roomListData = roomListData;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onRoomList);
	}
	_onInstanceList(msg: any): void {
		const { clientTag, instanceListData } = msg;
		this.clientTag = clientTag;
		this.instanceListData = instanceListData;
		this._trigger(C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds.onInstanceList);
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
