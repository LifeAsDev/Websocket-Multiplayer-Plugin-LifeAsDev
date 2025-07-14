import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds = {
	/* 	IsLargeNumber(this: SDKInstanceClass, num: number) {
		return num > 100;
	}, */
	onConnectedToSgWs(this: SDKInstanceClass, tag: string) {
		return true;
	},
	onLoggedInToSgWs(this: SDKInstanceClass, tag: string) {
		return true;
	},
	onJoinedRoom(this: SDKInstanceClass, tag: string) {
		return true;
	},
	isHost(this: SDKInstanceClass, tag: string) {
		return !!this._instanceWebRTC.clients.get(tag)?.isHost;
	},
	onPeerMessage(this: SDKInstanceClass, tag: string) {
		return tag === this.msgTag;
	},
	onPeerConnected(this: SDKInstanceClass) {
		return true;
	},
};
