const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Cnds = {
    /* 	IsLargeNumber(this: SDKInstanceClass, num: number) {
        return num > 100;
    }, */
    onConnectedToSgWs(tag) {
        return true;
    },
    onLoggedInToSgWs(tag) {
        return true;
    },
    onJoinedRoom(tag) {
        return true;
    },
    isHost(tag) {
        return !!this.clients.get(tag)?.isHost;
    },
    onPeerMessage(tag) {
        return tag === this.msgTag;
    },
    onPeerConnected() {
        return true;
    },
};
export {};
