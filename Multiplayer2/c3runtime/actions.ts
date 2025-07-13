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
	logIn(alias: string, tag: string): void {
		// Log in to signalling server
	},

	joinRoom(
		game: string,
		instance: string,
		room: string,
		tag: string,
		maxPeers: number
	): void {
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
	sendMessage(
		peerId: string,
		tag: string,
		clientTag: string,
		message: string,
		mode: string
	): void {
		// Send a message to a peer in the room
	},
};
