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
        // Log in to signalling server
    },
    joinRoom(game, instance, room, tag, maxPeers) {
        // Join a room on the signalling server
    },
    autoJoinRoom(game, instance, room, tag, maxPeers, locking) {
        // Automatically join a room on the signalling server
    },
    sendMessage(peerId, tag, clientTag, message, mode) {
        // Send a message to a peer in the room
    },
};
export {};
