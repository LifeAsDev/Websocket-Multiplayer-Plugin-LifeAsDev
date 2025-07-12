class ClientWebRTC {
	public tag: string;
	public ws: WebSocket | null = null;
	private SUBPROTOCOL: string = "c2multiplayer";
	public isLoggedIn: boolean = false;
	public isHost: boolean = false;
	public myid: string | null = null;
	public hostId: string | null = null;

	constructor(tag: string) {
		this.tag = tag;
	}

	signallingServerMessageHandler(msg: any) {
		switch (msg.message) {
			case "welcome":
				this.myid = msg.clientid;
			case "login-ok":
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
		const client = this.clients.get(tag) || new ClientWebRTC(tag); // Create a new client if it doesn't exist
		this.clients.set(tag, client);
		client.connectToSignallingServer(serverUrl);
	}
}
