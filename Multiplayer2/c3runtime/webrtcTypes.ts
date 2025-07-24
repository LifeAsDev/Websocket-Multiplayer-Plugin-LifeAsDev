export type TagCallback = (tag: string) => void;

export type OnPeerMessageCallback = (
	peerId: string,
	clientTag: string,
	message: string,
	tag: string,
	peerAlias: string
) => void;

export type OnPeerJoinedCallback = (
	peerId: string,
	peerAlias: string,
	tag: string
) => void;

export interface SendQueueEntry {
	message: string;
	ready: boolean;
}

export type ClientSerializable = {
	tag: string;
	isLoggedIn: boolean;
	isConnected: boolean;
	isHost: boolean;
	myid: string;
	myAlias: string;
	hostId: string;
	hostAlias: string;
	game: string;
	instance: string;
	room: string;
	isOnRoom: boolean;
	ice_servers: {
		urls: string | string[];
		username: string | null;
		credential: string | null;
	}[];
	simLatency: number;
	simPdv: number;
	simPacketLoss: number;
	leaveReason: string;
	peerCount: number;
};
export interface PeerConnectionWrapper {
	conn: RTCPeerConnection;
	channels: {
		unorderedReliable: RTCDataChannel | null;
		orderedReliable: RTCDataChannel | null;
		unreliable: RTCDataChannel | null;
	};
	state: "new" | "connected";
	lastPing: number | null;
	isReady: boolean;
	peerId: string;
	peerAlias: string;
}
