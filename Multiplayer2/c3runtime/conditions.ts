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
		return !!this.clients.get(tag)?.isHost;
	},
	onPeerMessage(this: SDKInstanceClass, tag: string) {
		return tag === this.msgTag;
	},
	onAnyPeerMessage(this: SDKInstanceClass) {
		return true;
	},
	onPeerConnected(this: SDKInstanceClass) {
		return true;
	},
	onDisconnectedFromSignalling(this: SDKInstanceClass) {
		return true;
	},
	onPeerDisconnected(this: SDKInstanceClass) {
		return true;
	},
	isLoggedIn(this: SDKInstanceClass, clientTag: string) {
		return !!this.clients.get(clientTag)?.isLoggedIn;
	},
	isConnected(this: SDKInstanceClass, clientTag: string) {
		return !!this.clients.get(clientTag)?.isConnected;
	},
	onLeftRoom(this: SDKInstanceClass) {
		return true;
	},
	onKicked(this: SDKInstanceClass) {
		return true;
	},
	isInRoom(this: SDKInstanceClass, clientTag: string) {
		return !!this.clients.get(clientTag)?.isOnRoom;
	},
	onError(this: SDKInstanceClass) {
		return true;
	},
	onRoomList(this: SDKInstanceClass) {
		return true;
	},
	onInstanceList(this: SDKInstanceClass) {
		return true;
	},
};
