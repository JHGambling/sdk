import { WebsocketPacket } from "./packet";

// Connection status enum
export enum ConnectionStatus {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    RECONNECTING = "RECONNECTING",
}

// Connection events
export enum ConnectionEvent {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    MESSAGE = "message",
    ERROR = "error",
    RECONNECTING = "reconnecting",
    PING = "ping",
}

// Event callback types
export type ConnectionEventCallback = () => void;
export type MessageEventCallback = (packet: WebsocketPacket) => void;
export type ErrorEventCallback = (error: Error) => void;
export type ReconnectingEventCallback = (attemptNumber: number) => void;
export type PingEventCallback = (pingTime: number) => void;

// Request timeout error
export class RequestTimeoutError extends Error {
    constructor(
        message: string,
        public readonly nonce: number,
    ) {
        super(message);
        this.name = "RequestTimeoutError";
    }
}

// Request configuration
export interface RequestOptions {
    timeout?: number;
    retries?: number;
}
