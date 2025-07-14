const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
    /* 	LogToConsole(this: SDKInstanceClass) {
        console.log(
            "This is the 'Log to console' action. Test property = " +
                this._getTestProperty()
        );
    }, */
    connect(url, tag) {
        this._instanceWebRTC.connectToSignallingServer(url, tag);
    },
    logIn(alias, tag) {
        this._instanceWebRTC.clients.get(tag)?.loginToSignallingServer(alias);
    },
    joinRoom(game, instance, room, tag, maxPeers) {
        this._instanceWebRTC.clients
            .get(tag)
            ?.joinRoom(game, instance, room, maxPeers);
        // Join a room on the signalling server
    },
    autoJoinRoom(game, instance, room, tag, maxPeers, locking) {
        console.log(typeof locking, locking);
        this._instanceWebRTC.clients
            .get(tag)
            ?.autoJoinRoom(game, instance, room, maxPeers, locking === 0);
    },
    sendPeerMessage(peerId, tag, clientTag, message, mode = 0) {
        const modes = ["unorderedReliable", "orderedReliable", "unreliable"];
        const modeName = modes[mode];
        const messageString = JSON.stringify({ type: "default", tag, message });
        this._instanceWebRTC.clients
            .get(clientTag)
            ?.sendMessageToPeer(peerId, messageString, modeName);
    },
};
export {};
