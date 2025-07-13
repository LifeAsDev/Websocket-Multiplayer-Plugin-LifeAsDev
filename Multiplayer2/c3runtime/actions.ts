import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
	/* 	LogToConsole(this: SDKInstanceClass) {
		console.log(
			"This is the 'Log to console' action. Test property = " +
				this._getTestProperty()
		);
	}, */
	connect(this: SDKInstanceClass, url: string, tag: string): void {
		this._instanceWebRTC.connectToSignallingServer(url, tag);
	},
	logIn(this: SDKInstanceClass, alias: string, tag: string): void {
		this._instanceWebRTC.clients.get(tag)?.loginToSignallingServer(alias);
	},

	joinRoom(
		this: SDKInstanceClass,
		game: string,
		instance: string,
		room: string,
		tag: string,
		maxPeers: number
	): void {
		this._instanceWebRTC.clients
			.get(tag)
			?.joinRoom(game, instance, room, maxPeers);
		// Join a room on the signalling server
	},
	autoJoinRoom(
		game: string,
		instance: string,
		room: string,
		tag: string,
		maxPeers: number,
		locking: boolean
	): void {
		// Automatically join a room on the signalling server
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

		const messageString = JSON.stringify({ type: "default", tag, message });
		this._instanceWebRTC.clients
			.get(clientTag)
			?.sendMessageToPeer(peerId, messageString, modeName);
	},
};
