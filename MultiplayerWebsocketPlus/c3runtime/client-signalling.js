// Asegúrate de cargar primero socket.io.min.js antes de este script
import { io, Socket } from "./socketio-client.js";
export default class ClientSignalling {
	serverUrl;
	socket = null;
	room = null;
	isHost = false;
	connected = false;
	peers = new Map();
	runtime;
	options;
	eventHandlers = {};
	constructor(options = {}) {
		this.serverUrl = "";
		this.runtime = runtime;
		this.options = {
			path: options.path || "/signalling/socket.io",
			reconnect: options.reconnect !== false,
			autoConnect: options.autoConnect !== false,
		};
	}
	// 🔹 Conectar al servidor
	connect(serverUrl) {
		if (this.connected) return;
		this.serverUrl = serverUrl;
		this.socket = io(this.serverUrl, { path: this.options.path });
		this.socket.on("signalling:connected", () => {
			this.connected = true;
			this.runtime.callFunction("WS-OnConnected");
		});
		this.socket.on("disconnect", () => {
			this.connected = false;
			this._emitLocal("disconnect");
		});
		this.socket.on("room_created", (roomName) => {
			this.room = roomName;
			this.isHost = true;
			this.runtime.callFunction("WS-OnJoinedRoom");
		});
		this.socket.on("room_joined", (roomName) => {
			this.room = roomName;
			this.isHost = false;
			this.runtime.callFunction("WS-OnJoinedRoom");
		});
		this.socket.on("signalling:message", (data) => {
			this.onMessage(data);
		});
		this.socket.on("signalling:rooms_list", (rooms) => {
			this.runtime.callFunction("WS-RoomsList", rooms.join(","));
		});
	}
	// 🔹 Crear sala (host)
	createRoom(roomName) {
		if (!this.connected || this.room) return;
		this.socket?.emit("create_room", roomName);
	}
	// 🔹 Unirse a sala
	joinRoom(roomName) {
		if (!this.connected || this.room) return;
		this.socket?.emit("join_room", roomName);
	}
	// 🔹 Desconectar de la sala
	disconnectFromRoom() {
		if (!this.connected || !this.room) return;
		this.socket?.emit("leave_room", this.room);
		this.room = null;
		this.isHost = false;
		this.runtime.callFunction("WS-OnDisconnectedFromRoom");
	}
	// 🔹 Desconectar del servidor de señalización
	disconnectFromSignalling() {
		if (!this.connected) return;
		this.socket?.disconnect();
		this.connected = false;
		this.room = null;
		this.isHost = false;
		this.runtime.callFunction("WS-OnDisconnectedFromSignalling");
	}
	sendMessage(targetId, message, tag = "") {
		if (!this.socket || !this.room) return;
		if (!this.isHost) targetId = null;
		this.socket.emit("send_message", {
			targetId: targetId === "" ? undefined : targetId,
			message,
			tag,
		});
	}
	broadcastMessage(fromId, message, tag = "") {
		if (!this.socket || !this.room || !this.isHost) return;
		this.socket.emit("broadcast_message", {
			fromId,
			message,
			tag,
		});
	}
	getListRooms() {
		this.socket?.emit("list_rooms");
	}
	// 🔹 Escuchar eventos locales
	on(event, callback) {
		if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
		this.eventHandlers[event].push(callback);
	}
	_emitLocal(event, data) {
		const handlers = this.eventHandlers[event];
		if (handlers) handlers.forEach((cb) => cb(data));
	}
	// placeholder para el método que manejaba mensajes del servidor
	onMessage(data) {
		this._emitLocal("message", data);
	}
}
