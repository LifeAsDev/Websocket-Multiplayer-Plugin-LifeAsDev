interface PeerConnectionWrapper {
	lastPing: number | null;
	isReady: boolean;
	peerId: string;
	peerAlias: string;
}

class ClientWebRTC {
	tag: string;
	private SUBPROTOCOL: string = "c2multiplayer";
	isLoggedIn: boolean = false;
	isConnected: boolean = false;
	isHost: boolean = false;
	myid: string = "";
	myAlias: string = "";
	hostId: string = "";
	hostAlias: string = "";
	game: string = "";
	instance: string = "";
	room: string = "";
	isOnRoom: boolean = false;
	connectionsWebRTC: Map<string, PeerConnectionWrapper> = new Map();
	ice_servers: RTCIceServer[] = [];
	simLatency: number = 0;
	simPdv: number = 0;
	simPacketLoss: number = 0;

	constructor(tag: string) {
		this.tag = tag;
	}
}

export class WebRTC {
	clients: Map<string, ClientWebRTC> = new Map();
	constructor() {}
}
