class ClientWebRTC {
	public tag: string;
	public ws: WebSocket | null = null;
	private SUBPROTOCOL: string = "c2multiplayer";
	public isLoggedIn: boolean = false;
	public isConnected: boolean = false;
	public isHost: boolean = false;
	public myid: string | null = null;
	public hostId: string | null = null;
	public onConnectedToSignallingServer: (tag: string) => void;
	public onLoggedIn: (tag: string) => void;

	constructor(
		tag: string,
		onConnectedToSignallingServer: (tag: string) => void,
		onLoggedIn: (tag: string) => void
	) {
		this.onConnectedToSignallingServer = onConnectedToSignallingServer;
		this.tag = tag;
		this.onLoggedIn = onLoggedIn;
	}

	signallingServerMessageHandler(msg: any) {
		switch (msg.message) {
			case "welcome":
				this.myid = msg.clientid;
				this.onConnectedToSignallingServer(this.tag);
				this.isConnected = true;
				break;
			case "login-ok":
				this.isLoggedIn = true;
				this.onLoggedIn(this.tag);
				break;

			case "join-ok":
				this.isHost = msg.host;
				this.hostId = msg.hostid;
				break;

			case "peer-joined":
				break;

			case "offer":
				break;

			case "answer":
				break;

			case "icecandidate":
				break;
		}
	}

	async connectToSignallingServer(serverUrl: string): Promise<void> {
		if (this.ws) {
			return;
		}

		this.ws = new WebSocket(serverUrl, this.SUBPROTOCOL);

		this.ws.onopen = () => {};

		this.ws.onmessage = (event) => {
			this.signallingServerMessageHandler(JSON.parse(event.data));
		};

		this.ws.onerror = (error) => {
			console.error(`WebSocket error for tag ${this.tag}:`, error);
		};

		this.ws.onclose = () => {
			console.log(`WebSocket connection closed for tag ${this.tag}`);
			this.ws = null; // Reset the WebSocket instance
		};
	}

	async loginToSignallingServer(alias: string): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}
		this.ws.send(
			JSON.stringify({
				message: "login",
				protocolrev: 1,
				datachannelrev: 2,
				compressionformats: ["deflate", "gzip"],
				alias,
			})
		);
	}
	async joinRoom(room: string): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}

		this.ws.send({
			message: "join",
			room,
		});
	}

	// send a message to the signalling server
	async sendSgws(message: { [key: string]: any }): Promise<void> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket is not connected");
		}

		this.ws.send(JSON.stringify(message));
	}
}

class WebRTC {
	public clients: Map<string, ClientWebRTC>;

	constructor() {
		this.clients = new Map();
	}

	async connectToSignallingServer(
		serverUrl: string,
		tag: string
	): Promise<void> {
		const client =
			this.clients.get(tag) ||
			new ClientWebRTC(
				tag,
				this.onConnectedToSignallingServer,
				this.onLoggedIn
			); // Create a new client if it doesn't exist
		this.clients.set(tag, client);
		client.connectToSignallingServer(serverUrl);
	}

	onConnectedToSignallingServer(tag: string) {
		this.clients.get(tag);
	}
	onLoggedIn(tag: string) {
		this.clients.get(tag);
	}
}
