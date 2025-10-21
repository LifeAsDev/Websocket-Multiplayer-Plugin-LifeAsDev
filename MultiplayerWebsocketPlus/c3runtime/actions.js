const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
	connect(url) {
		this.client.connect(url);
	},
	disconnectFromRoom() {
		this.client.disconnectFromRoom();
	},
	disconnectFromSignalling() {
		this.client.disconnectFromSignalling();
	},
	requestRoomList() {
		this.client.getListRooms();
	},
};
export {};
