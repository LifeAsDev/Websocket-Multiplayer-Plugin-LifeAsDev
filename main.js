const SERVER_URL = "wss://multiplayer.construct.net/";
const SUBPROTOCOL = "c2multiplayer";
const ICE_SERVERS = [	
	{ urls: "stun:stun.l.google.com:19302" },
	{
		urls: "turn:multiplayer-turn.construct.net",
		username: "scirra",
		credential: "construct",
	},
];

let clientCount = 0;

document.getElementById("addClientBtn").addEventListener("click", () => {
	createClient();
});

function createClient() {
	const container = document.createElement("div");
	container.className = "client";
	container.innerHTML = `
    <h3>Client ${clientCount}</h3>
    <div class="chat">
      <div class="messages"></div>
      <input type="text" placeholder="Type a message" disabled />
    </div>
    <pre class="log"></pre>
  `;
	document.getElementById("clients").appendChild(container);

	const log = (msg) => {
		const logElement = container.querySelector(".log");
		logElement.textContent += msg + "\n";
		logElement.scrollTop = logElement.scrollHeight;
	};

	const printChat = (msg) => {
		const messages = container.querySelector(".messages");
		const div = document.createElement("div");
		div.textContent = msg;
		messages.appendChild(div);
		messages.scrollTop = messages.scrollHeight;
	};

	const alias = `Client${clientCount++}`;
	const game = "ForADiceLifeasDev";
	const instance = "default";
	const room = "0000";

	const ws = new WebSocket(SERVER_URL, SUBPROTOCOL);
	let peerConnection = null;
	let dataChannel = null;
	let hostId = null;
	let isHost = false;
	let myid = null;
	// Override send para loguear todo
	const originalSend = ws.send.bind(ws);
	ws.send = (data) => {
		log("> " + data);
		originalSend(data);
	};

	ws.onopen = () => {
		log("✔ Connected to signaling server");

		ws.send(
			JSON.stringify({
				message: "login",
				protocolrev: 1,
				datachannelrev: 2,
				compressionformats: ["deflate", "gzip"],
				alias,
			})
		);
	};

	ws.onmessage = async (event) => {
		const msg = JSON.parse(event.data);
		log("← " + JSON.stringify(msg));

		switch (msg.message) {
			case "welcome":
				myid = msg.clientid;
			case "login-ok":
				ws.send(
					JSON.stringify({
						message: "auto-join",
						game,
						instance,
						room,
						max_clients: 4,
						lock_when_full: false,
					})
				);
				break;

			case "join-ok":
				isHost = msg.host;
				hostId = msg.hostid;
				break;

			case "peer-joined":
				setupPeer(msg);
				break;

			case "offer":
				setupPeer(msg);
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(msg.offer)
				);
				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);
				ws.send(
					JSON.stringify({
						message: "answer",
						answer,
						toclientid: msg.from,
					})
				);
				break;

			case "answer":
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(msg.answer)
				);
				break;

			case "icecandidate":
				if (msg.icecandidate) {
					try {
						await peerConnection.addIceCandidate(
							new RTCIceCandidate(msg.icecandidate)
						);
					} catch (e) {
						log("⚠ Error adding ICE candidate: " + e.message);
					}
				}
				break;
		}
	};

	function setupPeer(msg) {
		peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

		peerConnection.onicecandidate = (e) => {
			if (e.candidate) {
				ws.send(
					JSON.stringify({
						message: "icecandidate",
						toclientid: msg.peerid,
						icecandidate: e.candidate,
					})
				);
			}
		};

		peerConnection.onconnectionstatechange = () => {
			log("📡 Connection state: " + peerConnection.connectionState);
		};

		if (isHost) {
			dataChannel = peerConnection.createDataChannel("chat");
			setupDataChannel();

			peerConnection.createOffer().then((offer) => {
				return peerConnection.setLocalDescription(offer).then(() => {
					ws.send(
						JSON.stringify({
							message: "offer",
							offer,
							toclientid: msg.peerid,
						})
					);
				});
			});
		} else {
			peerConnection.ondatachannel = (event) => {
				dataChannel = event.channel;
				setupDataChannel();
			};
		}
	}

	function setupDataChannel() {
		dataChannel.onopen = () => {
			log("✔ Data channel opened");
			if (!isHost) {
				dataChannel.send(
					JSON.stringify({
						type: "peer-id",
						id: myid,
					})
				);
				log("» Sent peer-id to host: " + clientId);
			}
			const input = container.querySelector("input");
			input.disabled = false;
			input.addEventListener("keydown", (e) => {
				if (e.key === "Enter" && input.value.trim()) {
					const msg = alias + ": " + input.value.trim();
					dataChannel.send(msg);
					printChat("You: " + input.value.trim());
					input.value = "";
				}
			});
		};

		dataChannel.onmessage = (e) => {
			try {
				const msg = JSON.parse(e.data);
				if (msg.type === "peer-id") {
					ws.send(
						JSON.stringify({
							message: "confirm-peer",
							id: msg.id,
						})
					);
					return;
				}
			} catch {
				// No JSON, mensaje normal:
				printChat(e.data);
			}
		};

		dataChannel.onerror = (e) => {
			log("⚠ DataChannel error: " + e.message);
		};

		dataChannel.onclose = () => {
			log("✖ Data channel closed");
		};
	}

	ws.onerror = (e) => {
		log("⚠ WebSocket error");
	};

	ws.onclose = () => {
		log("✖ Connection closed");
	};
}
