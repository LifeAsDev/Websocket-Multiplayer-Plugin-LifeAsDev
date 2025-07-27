const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Exps = {
    /* 	Double(this: SDKInstanceClass, num: number) {
        return num * 2;
    }, */
    ClientTag() {
        return this.clientTag;
    },
    Message() {
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
    LeaveReason(clienTag) {
        return this.clients.get(clienTag)?.leaveReason;
    },
    Tag() {
        return this.msgTag;
    },
    ErrorMessage() {
        return this.errorMessage;
    },
    CurrentGame(clientTag) {
        return this.clients.get(clientTag)?.game || "";
    },
    CurrentInstance(clientTag) {
        return this.clients.get(clientTag)?.instance || "";
    },
    CurrentRoom(clientTag) {
        return this.clients.get(clientTag)?.room || "";
    },
    ListRoomCount() {
        return this.roomListData.length;
    },
    ListRoomName(index) {
        return this.roomListData[index]?.name || "";
    },
    ListRoomPeerCount(index) {
        return this.roomListData[index]?.peercount || 0;
    },
    ListRoomMaxPeerCount(index) {
        return this.roomListData[index]?.maxpeercount || 0;
    },
    ListRoomState(index) {
        return this.roomListData[index]?.state || "";
    },
    ListInstanceCount() {
        return this.instanceListData.length;
    },
    ListInstanceName(index) {
        return this.instanceListData[index]?.name || "";
    },
    ListInstancePeerCount(index) {
        return this.instanceListData[index]?.peercount || 0;
    },
    PeerCount(clientTag) {
        const client = this.clients.get(clientTag);
        if (!client || !client.isOnRoom) {
            return 0;
        }
        return client.peerCount;
    },
    CurrentClient() {
        return this.currentClientTag || "";
    },
    FromID() {
        return this.peerId;
    },
    FromAlias() {
        return this.peerAlias;
    },
    HostAlias(tag) {
        return this.clients.get(tag)?.hostAlias || "";
    },
    MyAlias(tag) {
        return this.clients.get(tag)?.myAlias || "";
    },
    PeerIDFromAlias(alias, clientTag) {
        const client = this.clients.get(clientTag);
        if (!client)
            return "";
        const match = client.peersList.find((p) => p.peerAlias === alias);
        return match ? match.peerId : "";
    },
    PeerAliasFromID(peerId, clientTag) {
        const client = this.clients.get(clientTag);
        if (!client)
            return "";
        const match = client.peersList.find((p) => p.peerId === peerId);
        return match ? match.peerAlias : "";
    },
    PeerIDAt(index, clientTag) {
        const client = this.clients.get(clientTag);
        if (!client)
            return "";
        const peer = client.peersList[index];
        return peer ? peer.peerId : "";
    },
    PeerAliasAt(index, clientTag) {
        const client = this.clients.get(clientTag);
        if (!client)
            return "";
        const peer = client.peersList[index];
        return peer ? peer.peerAlias : "";
    },
};
export {};
