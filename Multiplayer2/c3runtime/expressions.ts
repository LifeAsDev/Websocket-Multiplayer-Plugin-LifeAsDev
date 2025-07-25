import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Exps = {
	/* 	Double(this: SDKInstanceClass, num: number) {
		return num * 2;
	}, */
	ClientTag(this: SDKInstanceClass) {
		return this.clientTag;
	},
	Message(this: SDKInstanceClass) {
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
	Tag(this: SDKInstanceClass) {
		return this.msgTag;
	},
	ErrorMessage(this: SDKInstanceClass) {
		return this.errorMessage;
	},
	CurrentGame(this: SDKInstanceClass, clientTag: string) {
		return this.clients.get(clientTag)?.game || "";
	},
	CurrentInstance(this: SDKInstanceClass, clientTag: string) {
		return this.clients.get(clientTag)?.instance || "";
	},
	CurrentRoom(this: SDKInstanceClass, clientTag: string) {
		return this.clients.get(clientTag)?.room || "";
	},
	ListRoomCount(this: SDKInstanceClass): number {
		return this.roomListData.length;
	},
	ListRoomName(this: SDKInstanceClass, index: number): string {
		return this.roomListData[index]?.name || "";
	},
	ListRoomPeerCount(this: SDKInstanceClass, index: number): number {
		return this.roomListData[index]?.peercount || 0;
	},
	ListRoomMaxPeerCount(this: SDKInstanceClass, index: number): number {
		return this.roomListData[index]?.maxpeercount || 0;
	},
	ListRoomState(this: SDKInstanceClass, index: number): string {
		return this.roomListData[index]?.state || "";
	},
	ListInstanceCount(this: SDKInstanceClass): number {
		return this.instanceListData.length;
	},
	ListInstanceName(this: SDKInstanceClass, index: number): string {
		return this.instanceListData[index]?.name || "";
	},
	ListInstancePeerCount(this: SDKInstanceClass, index: number): number {
		return this.instanceListData[index]?.peercount || 0;
	},
	PeerCount(this: SDKInstanceClass, clientTag: string): number {
		const client = this.clients.get(clientTag);
		if (!client || !client.isOnRoom) {
			return 0;
		}
		return client.peerCount;
	},
	CurrentClient(this: SDKInstanceClass): string {
		return this.currentClientTag || "";
	},
};
