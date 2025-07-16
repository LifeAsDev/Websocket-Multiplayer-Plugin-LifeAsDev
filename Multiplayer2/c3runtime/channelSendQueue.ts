import type { SendQueueEntry } from "./webrtcTypes";

class ChannelSendQueue {
	private queue: SendQueueEntry[] = [];
	private sending = false;

	constructor(
		private datachannel: RTCDataChannel,
		private peerId: string,
		private tag: string,
		private simLatency: number,
		private simPdv: number
	) {}

	public enqueue(message: string): void {
		const entry: SendQueueEntry = { message, ready: false };
		this.queue.push(entry);

		const jitter = Math.random() * this.simPdv * 2 - this.simPdv;
		const delay = Math.max(0, this.simLatency + jitter);

		setTimeout(() => {
			entry.ready = true;
			this.processNext();
		}, delay);

		this.processNext();
	}

	private processNext(): void {
		if (this.sending || this.queue.length === 0) return;

		const entry = this.queue[0];
		if (!entry.ready) return;

		this.sending = true;
		try {
			this.datachannel.send(entry.message);
		} catch (e) {
			console.error(`[${this.tag}] Error enviando a ${this.peerId}:`, e);
		}

		this.queue.shift();
		this.sending = false;
		this.processNext();
	}
}

declare global {
	interface Window {
		ChannelSendQueue: typeof ChannelSendQueue;
	}
}
self.ChannelSendQueue = ChannelSendQueue; // Expose the WebRTC class globally
