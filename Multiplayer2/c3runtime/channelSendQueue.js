class ChannelSendQueue {
    datachannel;
    peerId;
    tag;
    simLatency;
    simPdv;
    queue = [];
    sending = false;
    constructor(datachannel, peerId, tag, simLatency, simPdv) {
        this.datachannel = datachannel;
        this.peerId = peerId;
        this.tag = tag;
        this.simLatency = simLatency;
        this.simPdv = simPdv;
    }
    enqueue(message) {
        const entry = { message, ready: false };
        this.queue.push(entry);
        const jitter = Math.random() * this.simPdv * 2 - this.simPdv;
        const delay = Math.max(0, this.simLatency + jitter);
        setTimeout(() => {
            entry.ready = true;
            this.processNext();
        }, delay);
        this.processNext();
    }
    processNext() {
        if (this.sending || this.queue.length === 0)
            return;
        const entry = this.queue[0];
        if (!entry.ready)
            return;
        this.sending = true;
        try {
            this.datachannel.send(entry.message);
        }
        catch (e) {
            console.error(`[${this.tag}] Error enviando a ${this.peerId}:`, e);
        }
        this.queue.shift();
        this.sending = false;
        this.processNext();
    }
}
self.ChannelSendQueue = ChannelSendQueue; // Expose the WebRTC class globally
export {};
