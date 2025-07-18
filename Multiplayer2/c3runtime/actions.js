const C3 = globalThis.C3;
C3.Plugins.Lifeasdev_MultiplayerPlugin.Acts = {
    connect(url, tag) {
        this._postToDOM("connect", { url, tag });
    },
    logIn(alias, tag) {
        this._postToDOM("login", { alias, tag });
    },
    joinRoom(game, instance, room, tag, maxPeers) {
        this._postToDOM("joinRoom", { game, instance, room, tag, maxPeers });
    },
    autoJoinRoom(game, instance, room, tag, maxPeers, locking) {
        this._postToDOM("autoJoinRoom", {
            game,
            instance,
            room,
            tag,
            maxPeers,
            locking: locking === 0,
        });
    },
    sendPeerMessage(peerId, tag, clientTag, message, mode = 0) {
        const modes = ["unorderedReliable", "orderedReliable", "unreliable"];
        const modeName = modes[mode];
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
    simulateLatency(latencyMs, pdvMs, lossPercent, clientTag) {
        this._postToDOM("simulate-latency", {
            latency: latencyMs,
            pdv: pdvMs,
            loss: lossPercent,
            clientTag,
        });
    },
    broadcastMessage(peerId, tag, clientTag, message, mode = 0) {
        const modes = ["unorderedReliable", "orderedReliable", "unreliable"];
        const modeName = modes[mode];
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
    disconnectFromSignalling(clientTag) {
        this._postToDOM("disconnectFromSignalling", { clientTag });
    },
    disconnectFromRoom(clientTag) {
        this._postToDOM("disconnectFromRoom", { clientTag });
    },
    leaveRoomOnSignalling(clientTag) {
        this._postToDOM("leaveRoomOnSignalling", { clientTag });
    },
};
export {};
