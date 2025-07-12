"use strict";
class ClientWebRTC {
    constructor(tag, onConnectedToSignallingServer, onLoggedIn) {
        this.ws = null;
        this.SUBPROTOCOL = "c2multiplayer";
        this.isLoggedIn = false;
        this.isConnected = false;
        this.isHost = false;
        this.myid = null;
        this.hostId = null;
        this.onConnectedToSignallingServer = onConnectedToSignallingServer;
        this.tag = tag;
        this.onLoggedIn = onLoggedIn;
    }
    signallingServerMessageHandler(msg) {
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
    async joinRoom(room) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send({
            message: "join",
            room,
        });
    }
    // send a message to the signalling server
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
        const client = this.clients.get(tag) ||
            new ClientWebRTC(tag, this.onConnectedToSignallingServer, this.onLoggedIn); // Create a new client if it doesn't exist
        this.clients.set(tag, client);
        client.connectToSignallingServer(serverUrl);
    }
    onConnectedToSignallingServer(tag) {
        this.clients.get(tag);
    }
    onLoggedIn(tag) {
        this.clients.get(tag);
    }
}
