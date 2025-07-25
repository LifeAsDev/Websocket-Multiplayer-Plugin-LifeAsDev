const fs = require("fs");

// Archivos de entrada/salida
const acesFilePath = "Multiplayer2/aces.json";
const langFilePath = "Multiplayer2/lang/en-US.json";

// Mapeo de IDs
const idMapping = {
	// --- Conditions ---
	isHost: "is-host",
	isConnected: "is-connected",
	isLoggedIn: "is-logged-in",
	isInRoom: "is-in-room",
	onConnectedToSgWs: "on-connected",
	onLoggedInToSgWs: "on-logged-in",
	onLeftRoom: "on-left-room",
	onError: "on-error",
	onRoomList: "on-room-list",
	onInstanceList: "on-game-instance-list",
	onJoinedRoom: "on-joined-room",
	onPeerMessage: "on-peer-message",
	onPeerConnected: "on-peer-connected",
	onDisconnectedFromSignalling: "on-disconnected",
	onPeerDisconnected: "on-peer-disconnected",
	onKicked: "on-kicked",
	onAnyPeerMessage: "on-any-peer-message",

	// --- Actions ---
	connect: "connect",
	logIn: "log-in",
	simulateLatency: "simulate-latency",
	disconnectFromRoom: "disconnect-room",
	disconnectFromSignalling: "disconnect-signalling",
	leaveRoomOnSignalling: "leave-room",
	requestRoomList: "request-room-list",
	requestInstanceList: "request-game-instance-list",
	joinRoom: "join-room",
	autoJoinRoom: "auto-join-room",
	sendPeerMessage: "send-message",
	broadcastMessage: "broadcast-message",
	kickPeer: "kick-peer",

	// --- Expressions ---
	ListInstanceName: "listInstanceName",
	ListInstanceCount: "listInstanceCount",
	ListInstancePeerCount: "listInstancePeerCount",
	ListRoomCount: "listRoomCount",
	ListRoomMaxPeerCount: "listRoomMaxPeerCount",
	ListRoomName: "listRoomName",
	ListRoomPeerCount: "listRoomPeerCount",
	ListRoomState: "listRoomState",
	FromAlias: "peerAlias",
	FromID: "peerId",
	HostAlias: "peerAlias",
	HostID: "hostId",
	LeaveReason: "leaveReason",
	Message: "message",
	PeerAlias: "peerAlias",
	PeerCount: "peerCount",
	PeerID: "peerId",
	Tag: "messageTag",
	CurrentGame: "currentGame",
	CurrentInstance: "currentInstance",
	CurrentRoom: "currentRoom",
	ErrorMessage: "errorMessage",
	MyAlias: "peerAlias",
	MyID: "myId",
};

// Función para actualizar IDs en objetos { oldId: { ... } }
function remapObjectKeys(obj) {
	const result = {};
	for (const key in obj) {
		const newKey = idMapping[key] || key;
		result[newKey] = obj[key];
	}
	return result;
}

// --------------------------
// Procesar aces.json
// --------------------------
let acesData = JSON.parse(fs.readFileSync(acesFilePath, "utf8"));
const sections = ["signalling", "room", "roomHost"];

sections.forEach((section) => {
	if (acesData[section]) {
		["conditions", "actions", "expressions"].forEach((subSection) => {
			if (acesData[section][subSection]) {
				acesData[section][subSection].forEach((item) => {
					if (idMapping[item.id]) {
						item.id = idMapping[item.id];
					}
				});
			}
		});
	}
});

// Guardar aces.json
fs.writeFileSync(acesFilePath, JSON.stringify(acesData, null, 4), "utf8");
console.log("✅ Archivo aces.json actualizado.");

// --------------------------
// Procesar en-US.json
// --------------------------
let langFileContent = fs.readFileSync(langFilePath, "utf8");
if (langFileContent.charCodeAt(0) === 0xfeff) {
	langFileContent = langFileContent.slice(1); // quitar BOM
}

const langData = JSON.parse(langFileContent);

const pluginData = langData.text.plugins?.lifeasdev_multiplayerplugin;
if (pluginData) {
	const keysToUpdate = ["conditions", "actions", "expressions"];

	keysToUpdate.forEach((key) => {
		if (pluginData[key]) {
			pluginData[key] = remapObjectKeys(pluginData[key]);
		}
	});
}

// Guardar en-US.json
const jsonWithBom = "\uFEFF" + JSON.stringify(langData, null, 4);
fs.writeFileSync(langFilePath, jsonWithBom, "utf8");
