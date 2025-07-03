var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ConnectionEvent, ConnectionStatus, RequestTimeoutError, } from "./types/ws";
export class WebSocketClient {
    constructor(options) {
        this.ws = null;
        this.status = ConnectionStatus.DISCONNECTED;
        this.reconnectAttempts = 0;
        this.eventListeners = new Map();
        this.nextNonce = 1;
        this.pendingRequests = new Map();
        this.pingTimer = null;
        this.latestPingTime = 0;
        this.url = options.url;
        this.autoReconnect = options.autoReconnect !== false;
        this.reconnectInterval = options.reconnectInterval || 1000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 50;
        this.debug = options.debug || false;
        this.requestTimeout = options.requestTimeout || 30000; // 30 seconds default
        this.pingInterval = options.pingInterval || 30000; // 30 seconds default
    }
    /**
     * Establish a WebSocket connection to the server
     */
    connect() {
        if (this.status === ConnectionStatus.CONNECTED ||
            this.status === ConnectionStatus.CONNECTING) {
            this.log("Already connected or connecting");
            return;
        }
        this.status = ConnectionStatus.CONNECTING;
        this.log(`Connecting to ${this.url}`);
        try {
            this.ws = new WebSocket(this.url);
            this.configureWebSocket();
        }
        catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Disconnect the WebSocket
     */
    disconnect() {
        if (this.ws &&
            (this.status === ConnectionStatus.CONNECTED ||
                this.status === ConnectionStatus.CONNECTING)) {
            this.log("Disconnecting");
            // Reject all pending requests
            this.rejectAllPendingRequests(new Error("WebSocket disconnected"));
            // Prevent auto reconnect when explicitly disconnected
            this.autoReconnect = false;
            this.stopPingTimer();
            this.ws.close();
        }
    }
    /**
     * Send a packet to the server
     */
    send(type, payload = {}) {
        if (this.status !== ConnectionStatus.CONNECTED) {
            throw new Error("Cannot send message: WebSocket is not connected");
        }
        const nonce = this.getNextNonce();
        const packet = {
            type,
            payload,
            nonce,
        };
        this.ws.send(JSON.stringify(packet));
        return nonce;
    }
    /**
     * Send a packet and wait for a response with matching nonce
     */
    request(type, payload = {}, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== ConnectionStatus.CONNECTED) {
                throw new Error("Cannot send request: WebSocket is not connected");
            }
            const nonce = this.getNextNonce();
            const packet = {
                type,
                payload,
                nonce,
            };
            return new Promise((resolve, reject) => {
                const timeoutMs = timeout || this.requestTimeout;
                // Set up timeout
                const timeoutHandle = setTimeout(() => {
                    this.pendingRequests.delete(nonce);
                    reject(new RequestTimeoutError(`Request timeout after ${timeoutMs}ms`, nonce));
                }, timeoutMs);
                // Store the pending request
                this.pendingRequests.set(nonce, {
                    resolve,
                    reject,
                    timeout: timeoutHandle,
                });
                // Send the packet
                this.ws.send(JSON.stringify(packet));
                this.log(`Sent request with nonce ${nonce}`, packet);
            });
        });
    }
    /**
     * Get the current connection status
     */
    getStatus() {
        return this.status;
    }
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    /**
     * Remove an event listener
     */
    off(event, callback) {
        if (!this.eventListeners.has(event))
            return;
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }
    /**
     * Configure WebSocket event handlers
     */
    configureWebSocket() {
        if (!this.ws)
            return;
        this.ws.onopen = () => {
            this.status = ConnectionStatus.CONNECTED;
            this.reconnectAttempts = 0;
            this.log("Connection established");
            this.startPingTimer();
            this.emit(ConnectionEvent.CONNECTED);
        };
        this.ws.onclose = () => {
            const wasConnected = this.status === ConnectionStatus.CONNECTED;
            this.status = ConnectionStatus.DISCONNECTED;
            // Reject all pending requests when connection closes
            this.rejectAllPendingRequests(new Error("WebSocket connection closed"));
            this.stopPingTimer();
            if (wasConnected) {
                this.log("Connection closed");
                this.emit(ConnectionEvent.DISCONNECTED);
            }
            if (this.autoReconnect) {
                this.attemptReconnect();
            }
        };
        this.ws.onerror = (event) => {
            this.log("WebSocket error", event);
            this.handleError(new Error("WebSocket error"));
        };
        this.ws.onmessage = (event) => {
            this.handleMessage(event);
        };
    }
    /**
     * Process incoming WebSocket messages
     */
    handleMessage(event) {
        try {
            const packet = JSON.parse(event.data);
            this.log("Received packet", packet);
            // Check if this is a response to a pending request
            if (packet.nonce && this.pendingRequests.has(packet.nonce)) {
                const pendingRequest = this.pendingRequests.get(packet.nonce);
                // Clear the timeout
                clearTimeout(pendingRequest.timeout);
                // Remove from pending requests
                this.pendingRequests.delete(packet.nonce);
                // Resolve the promise
                pendingRequest.resolve(packet);
                this.log(`Resolved request with nonce ${packet.nonce}`);
            }
            // Always emit the message event for other listeners
            this.emit(ConnectionEvent.MESSAGE, packet);
        }
        catch (error) {
            this.log("Error parsing message", error);
            this.handleError(new Error("Failed to parse incoming message"));
        }
    }
    /**
     * Handle WebSocket errors
     */
    handleError(error) {
        this.log("Error", error);
        this.emit(ConnectionEvent.ERROR, error);
    }
    /**
     * Attempt to reconnect to the server
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log("Max reconnect attempts reached");
            return;
        }
        this.status = ConnectionStatus.RECONNECTING;
        this.reconnectAttempts++;
        this.log(`Reconnecting: attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.emit(ConnectionEvent.RECONNECTING, this.reconnectAttempts);
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }
    /**
     * Emit an event to registered listeners
     */
    emit(event, ...args) {
        if (!this.eventListeners.has(event))
            return;
        for (const listener of this.eventListeners.get(event)) {
            try {
                listener(...args);
            }
            catch (error) {
                console.error("Error in event listener", error);
            }
        }
    }
    /**
     * Get the next nonce value
     */
    getNextNonce() {
        return this.nextNonce++;
    }
    /**
     * Reject all pending requests with the given error
     */
    rejectAllPendingRequests(error) {
        for (const [nonce, pendingRequest] of this.pendingRequests) {
            clearTimeout(pendingRequest.timeout);
            pendingRequest.reject(error);
        }
        this.pendingRequests.clear();
    }
    /**
     * Start the ping timer to keep the connection alive
     */
    startPingTimer() {
        this.stopPingTimer();
        this.pingTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (this.status === ConnectionStatus.CONNECTED) {
                let start = Date.now();
                yield this.request("ping", {});
                let pingTime = Date.now() - start;
                this.latestPingTime = pingTime;
                this.emit(ConnectionEvent.PING, this.latestPingTime);
            }
        }), this.pingInterval);
    }
    /**
     * Stop the ping timer
     */
    stopPingTimer() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
    /**
     * Internal logging function
     */
    log(...args) {
        if (this.debug) {
            console.log("[WebSocketClient]", ...args);
        }
    }
}
