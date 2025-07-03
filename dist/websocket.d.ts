import { ConnectionEvent, ConnectionStatus } from "./types/ws";
import { WebsocketPacket } from "./types/packet";
interface WebSocketClientOptions {
    url: string;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    debug?: boolean;
    requestTimeout?: number;
    pingInterval?: number;
}
export declare class WebSocketClient {
    private ws;
    private status;
    private reconnectAttempts;
    private eventListeners;
    private nextNonce;
    private pendingRequests;
    private url;
    private autoReconnect;
    private reconnectInterval;
    private maxReconnectAttempts;
    private debug;
    private requestTimeout;
    private pingInterval;
    private pingTimer;
    latestPingTime: number;
    constructor(options: WebSocketClientOptions);
    /**
     * Establish a WebSocket connection to the server
     */
    connect(): void;
    /**
     * Disconnect the WebSocket
     */
    disconnect(): void;
    /**
     * Send a packet to the server
     */
    send(type: string, payload?: any): number;
    /**
     * Send a packet and wait for a response with matching nonce
     */
    request(type: string, payload?: any, timeout?: number): Promise<WebsocketPacket>;
    /**
     * Get the current connection status
     */
    getStatus(): ConnectionStatus;
    /**
     * Register an event listener
     */
    on(event: ConnectionEvent.CONNECTED, callback: () => void): void;
    on(event: ConnectionEvent.DISCONNECTED, callback: () => void): void;
    on(event: ConnectionEvent.ERROR, callback: (error: Error) => void): void;
    on(event: ConnectionEvent.MESSAGE, callback: (packet: WebsocketPacket) => void): void;
    on(event: ConnectionEvent.RECONNECTING, callback: (attempt: number) => void): void;
    on(event: ConnectionEvent.PING, callback: (pingTime: number) => void): void;
    /**
     * Remove an event listener
     */
    off(event: string, callback: Function): void;
    /**
     * Configure WebSocket event handlers
     */
    private configureWebSocket;
    /**
     * Process incoming WebSocket messages
     */
    private handleMessage;
    /**
     * Handle WebSocket errors
     */
    private handleError;
    /**
     * Attempt to reconnect to the server
     */
    private attemptReconnect;
    /**
     * Emit an event to registered listeners
     */
    private emit;
    /**
     * Get the next nonce value
     */
    private getNextNonce;
    /**
     * Reject all pending requests with the given error
     */
    private rejectAllPendingRequests;
    /**
     * Start the ping timer to keep the connection alive
     */
    private startPingTimer;
    /**
     * Stop the ping timer
     */
    private stopPingTimer;
    /**
     * Internal logging function
     */
    private log;
}
export {};
