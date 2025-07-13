import { ChannelSendQueue } from "./channelSendQueue";
class ClientWebRTC {
    constructor(tag, onConnectedToSignallingServer, onLoggedIn, onJoinedRoom, onPeerJoined) {
        this.ws = null;
        this.SUBPROTOCOL = "c2multiplayer";
        this.isLoggedIn = false;
        this.isConnected = false;
        this.isHost = false;
        this.myid = null;
        this.hostId = null;
        this.game = null;
        this.instance = null;
        this.room = null;
        this.isOnRoom = false;
        this.connectionsWebRTC = new Map();
        this.ice_servers = null;
        this.simLatency = 0; // in milliseconds
        this.simPdv = 0; // in milliseconds
        this.simPacketLoss = 0; // percentage
        this.sendQueues = new Map();
        this.onConnectedToSignallingServer = onConnectedToSignallingServer;
        this.tag = tag;
        this.onLoggedIn = onLoggedIn;
        this.onJoinedRoom = onJoinedRoom;
        this.onPeerJoined = onPeerJoined;
    }
    signallingServerMessageHandler(msg) {
        switch (msg.message) {
            case "welcome":
                this.myid = msg.clientid;
                this.ice_servers = msg.ice_servers;
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
                this.isOnRoom = true;
                if (!this.isHost)
                    this.onPeerJoinedSGWS(msg.hostId, msg.hostalias);
                else
                    this.onJoinedRoom(this.tag);
                break;
            case "peer-joined":
                this.onPeerJoinedSGWS(msg.clientid, msg.alias);
                break;
            case "offer":
                this.handleOffer(msg.from, msg.offer);
                break;
            case "answer":
                this.handleAnswer(msg.from, msg.answer);
                break;
            case "icecandidate":
                this.handleIceCandidate(msg.from, msg.icecandidate);
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
    async autoJoinRoom(game, instance, room, max_clients, lock_when_full) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.sendSgws({
            message: "auto-join",
            game,
            instance,
            room,
            max_clients,
            lock_when_full,
        });
    }
    async joinRoom(game, instance, room, max_clients) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.sendSgws({
            message: "join",
            game,
            instance,
            room,
            max_clients,
        });
    }
    onPeerJoinedSGWS(peerId, peerAlias) {
        const peerConnection = {
            conn: new RTCPeerConnection({ iceServers: this.ice_servers || [] }),
            channels: {
                unorderedReliable: null,
                orderedReliable: null,
                unreliable: null,
            },
            state: "new",
            lastPing: null,
            isReady: false,
            peerId,
            peerAlias,
        };
        this.connectionsWebRTC.set(peerId, peerConnection);
        peerConnection.conn.onicecandidate = (e) => {
            if (e.candidate) {
                this.sendSgws({
                    message: "icecandidate",
                    toclientid: peerId,
                    icecandidate: e.candidate,
                });
            }
        };
        peerConnection.conn.onconnectionstatechange = () => { };
        this.setupDataChannel(peerConnection);
        this.sendQueues.set(peerId, new ChannelSendQueue(peerConnection.channels.orderedReliable, peerId, this.tag, this.simLatency, this.simPdv));
        if (this.isHost)
            peerConnection.conn.createOffer().then(async (offer) => {
                return peerConnection.conn.setLocalDescription(offer).then(() => {
                    this.sendSgws({
                        message: "offer",
                        offer,
                        toclientid: peerConnection.peerId,
                    });
                });
            });
        this.waitForReady(peerConnection).then(() => {
            peerConnection.isReady = true;
            if (this.isHost) {
                this.onPeerJoined(peerConnection.peerId, peerConnection.peerAlias, this.tag);
            }
            else {
                this.onJoinedRoom(this.tag);
            }
        });
    }
    setupDataChannel(peerConnection) {
        const dc_protocol = "C3M_" + this.game + "_" + this.instance + "_" + this.room;
        peerConnection.channels.orderedReliable =
            peerConnection.conn.createDataChannel("ordered-reliable", {
                ordered: true,
                protocol: dc_protocol,
            });
        peerConnection.channels.unorderedReliable =
            peerConnection.conn.createDataChannel("unordered-reliable", {
                ordered: false,
                protocol: dc_protocol,
            });
        peerConnection.channels.unreliable = peerConnection.conn.createDataChannel("unreliable", {
            ordered: false,
            maxRetransmits: 0,
            protocol: dc_protocol,
        });
    }
    async handleOffer(peerId, offer) {
        const peerConnection = this.connectionsWebRTC.get(peerId);
        if (!peerConnection) {
            return;
        }
        await peerConnection.conn.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.conn.createAnswer();
        await peerConnection.conn.setLocalDescription(answer);
        this.sendSgws({
            message: "answer",
            answer,
            toclientid: peerId,
        });
    }
    async handleAnswer(peerId, answer) {
        const peerConnection = this.connectionsWebRTC.get(peerId);
        if (!peerConnection) {
            return;
        }
        await peerConnection.conn.setRemoteDescription(new RTCSessionDescription(answer));
    }
    async handleIceCandidate(peerId, candidate) {
        const peerConnection = this.connectionsWebRTC.get(peerId);
        if (!peerConnection) {
            return;
        }
        await peerConnection.conn.addIceCandidate(new RTCIceCandidate(candidate));
    }
    // send a message to the signalling server
    async sendSgws(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        this.ws.send(JSON.stringify(message));
    }
    waitForReady(peerConnection) {
        return new Promise((resolve) => {
            const checkReady = () => {
                const connReady = peerConnection.conn.connectionState === "connected";
                const allChannelsReady = Object.values(peerConnection.channels).every((dc) => !dc || dc.readyState === "open");
                if (connReady && allChannelsReady) {
                    resolve();
                }
            };
            peerConnection.conn.onconnectionstatechange = checkReady;
            for (const dc of Object.values(peerConnection.channels)) {
                if (dc)
                    dc.onopen = checkReady;
            }
        });
    }
    sendMessageToPeer(peerId, message, channel) {
        if (peerId === "" && this.isHost)
            return;
        else if (peerId === "" && !this.isHost)
            peerId = this.hostId;
        const peerConnection = this.connectionsWebRTC.get(peerId);
        if (!peerConnection)
            return;
        const datachannel = peerConnection.channels[channel];
        if (!datachannel || datachannel.readyState !== "open")
            return;
        // Simular pérdida
        if (this.simPacketLoss > 0 && Math.random() < this.simPacketLoss / 100) {
            console.warn(`[${this.tag}] Paquete perdido simulado para ${peerId}`);
            return;
        }
        if (channel === "orderedReliable") {
            const queueMap = this.sendQueues.get(peerId);
            if (queueMap) {
                queueMap.enqueue(message);
                return;
            }
        }
        // Unordered: delay directo
        const jitter = Math.random() * this.simPdv * 2 - this.simPdv;
        const delay = Math.max(0, this.simLatency + jitter);
        setTimeout(() => {
            try {
                datachannel.send(message);
            }
            catch (e) {
                console.error(`[${this.tag}] Error enviando a ${peerId}:`, e);
            }
        }, delay);
    }
    broadcastMessageToPeers(fromId, message, channel) {
        for (const [peerId, _] of this.connectionsWebRTC.entries()) {
            if (peerId === fromId)
                continue;
            this.sendMessageToPeer(peerId, message, channel);
        }
    }
}
export class WebRTC {
    constructor() {
        this.clients = new Map();
    }
    async connectToSignallingServer(serverUrl, tag) {
        const client = this.clients.get(tag) ||
            new ClientWebRTC(tag, this.onConnectedToSignallingServer, this.onLoggedIn, this.onJoinedRoom, this.onPeerJoined); // Create a new client if it doesn't exist
        this.clients.set(tag, client);
        await client.connectToSignallingServer(serverUrl);
    }
    onConnectedToSignallingServer(tag) {
        this.clients.get(tag);
    }
    onLoggedIn(tag) {
        this.clients.get(tag);
    }
    onJoinedRoom(tag) {
        this.clients.get(tag);
    }
    onPeerJoined(peerId, peerAlias, tag) {
        this.clients.get(tag);
    }
}
