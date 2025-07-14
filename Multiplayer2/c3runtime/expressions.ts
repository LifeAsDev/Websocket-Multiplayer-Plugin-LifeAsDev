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
		return this._instanceWebRTC.clients.get(tag)?.hostId || "";
	},
};
