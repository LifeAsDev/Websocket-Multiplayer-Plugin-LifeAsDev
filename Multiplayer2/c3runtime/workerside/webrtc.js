class ClientWebRTC {
    tag;
    SUBPROTOCOL = "c2multiplayer";
    isLoggedIn = false;
    isConnected = false;
    isHost = false;
    myid = "";
    myAlias = "";
    hostId = "";
    hostAlias = "";
    game = "";
    instance = "";
    room = "";
    isOnRoom = false;
    connectionsWebRTC = new Map();
    ice_servers = [];
    simLatency = 0;
    simPdv = 0;
    simPacketLoss = 0;
    constructor(tag) {
        this.tag = tag;
    }
}
export class WebRTC {
    clients = new Map();
    constructor() { }
}
