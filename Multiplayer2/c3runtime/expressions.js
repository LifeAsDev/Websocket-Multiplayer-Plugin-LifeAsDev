const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Exps = {
    /* 	Double(this: SDKInstanceClass, num: number) {
        return num * 2;
    }, */
    ClientTag() {
        return this.clientTag;
    },
    message() {
        return this.msg;
    },
    PeerID() {
        return this.peerId;
    },
    HostID(tag) {
        return this.clients.get(tag)?.hostId || "";
    },
    MyID(tag) {
        return this.clients.get(tag)?.myid || "";
    },
    PeerAlias() {
        return this.peerAlias;
    },
};
export {};
