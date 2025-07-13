export type TagCallback = (tag: string) => void;

export type OnPeerMessageCallback = (
	peerId: string,
	clientTag: string,
	message: string,
	tag: string
) => void;

export type OnPeerJoinedCallback = (
	peerId: string,
	peerAlias: string,
	tag: string
) => void;
