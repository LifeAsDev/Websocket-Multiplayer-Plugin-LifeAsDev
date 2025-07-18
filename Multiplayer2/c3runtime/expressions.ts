import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Exps = {
	/* 	Double(this: SDKInstanceClass, num: number) {
		return num * 2;
	}, */
	ClientTag(this: SDKInstanceClass) {
		return this.clientTag;
	},
	message(this: SDKInstanceClass) {
		return this.msg;
	},
	PeerID(this: SDKInstanceClass) {
		return this.peerId;
	},
	HostID(this: SDKInstanceClass, tag: string) {
		return this.clients.get(tag)?.hostId || "";
	},
	MyID(this: SDKInstanceClass, tag: string) {
		return this.clients.get(tag)?.myid || "";
	},
	PeerAlias(this: SDKInstanceClass) {
		return this.peerAlias;
	},
	LeaveReason(this: SDKInstanceClass, clienTag: string) {
		return this.clients.get(clienTag)?.leaveReason;
	},
	messageTag(this: SDKInstanceClass) {
		return this.msgTag;
	},
};
