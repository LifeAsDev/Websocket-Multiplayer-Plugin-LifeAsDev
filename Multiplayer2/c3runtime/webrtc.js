"use strict";
class ClientWebRTC {
    constructor(tag) {
        this.ws = null;
        this.SUBPROTOCOL = "c2multiplayer";
        this.isLoggedIn = false;
        this.isHost = false;
        this.myid = null;
        this.hostId = null;
        this.tag = tag;
    }
    signallingServerMessageHandler(msg) {
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
    async connectToSignallingServer(serverUrl) {
        if (this.ws) {
            return;
        }
        this.ws = new WebSocket(serverUrl, this.SUBPROTOCOL);
        this.ws.onopen = () => { };
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
    async loginToSignallingServer(alias) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send(JSON.stringify({
            message: "login",
            protocolrev: 1,
            datachannelrev: 2,
            compressionformats: ["deflate", "gzip"],
            alias,
        }));
    }
    async sendSgws(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send(JSON.stringify(message));
    }
}
class WebRTC {
    constructor() {
        this.clients = new Map();
    }
    async connectToSignallingServer(serverUrl, tag) {
        const client = this.clients.get(tag) || new ClientWebRTC(tag); // Create a new client if it doesn't exist
        this.clients.set(tag, client);
        client.connectToSignallingServer(serverUrl);
    }
}
