import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
	connect(this: SDKInstanceClass, url: string, tag: string): void {
		this._postToDOM("connect", { url, tag });
	},

	logIn(this: SDKInstanceClass, alias: string, tag: string): void {
		this._postToDOM("login", { alias, tag });
	},

	joinRoom(
		this: SDKInstanceClass,
		game: string,
		instance: string,
		room: string,
		tag: string,
		maxPeers: number
	): void {
		this._postToDOM("joinRoom", { game, instance, room, tag, maxPeers });
	},

	autoJoinRoom(
		this: SDKInstanceClass,
		game: string,
		instance: string,
		room: string,
		tag: string,
		maxPeers: number,
		locking: number
	): void {
		this._postToDOM("autoJoinRoom", {
			game,
			instance,
			room,
			tag,
			maxPeers,
			locking: locking === 0,
		});
	},

	sendPeerMessage(
		this: SDKInstanceClass,
		peerId: string,
		tag: string,
		clientTag: string,
		message: string,
		mode: number = 0
	): void {
		const modes = ["unorderedReliable", "orderedReliable", "unreliable"];
		const modeName = modes[mode] as
			| "unorderedReliable"
			| "orderedReliable"
			| "unreliable";

		const messageString = JSON.stringify({
			type: "default",
			tag,
			message,
		});

		this._postToDOM("sendPeerMessage", {
			peerId,
			clientTag,
			message: messageString,
			mode: modeName,
		});
	},
	simulateLatency(
		this: SDKInstanceClass,
		latencyMs: number,
		pdvMs: number,
		lossPercent: number,
		clientTag: string
	): void {
		this._postToDOM("simulate-latency", {
			latency: latencyMs,
			pdv: pdvMs,
			loss: lossPercent,
			clientTag,
		});
	},
	broadcastMessage(
		this: SDKInstanceClass,
		peerId: string,
		tag: string,
		clientTag: string,
		message: string,
		mode: number = 0
	): void {
		const modes = ["unorderedReliable", "orderedReliable", "unreliable"];
		const modeName = modes[mode] as
			| "unorderedReliable"
			| "orderedReliable"
			| "unreliable";

		const messageString = JSON.stringify({
			type: "default",
			tag,
			message,
		});

		this._postToDOM("broadcastMessage", {
			fromId: peerId,
			clientTag,
			message: messageString,
			mode: modeName,
		});
	},
	disconnectFromSignalling(this: SDKInstanceClass, clientTag: string): void {
		this._postToDOM("disconnectFromSignalling", { clientTag });
	},
	disconnectFromRoom(this: SDKInstanceClass, clientTag: string): void {
		this._postToDOM("disconnectFromRoom", { clientTag });
	},
};
