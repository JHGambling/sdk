import { WebsocketPacket } from "./packet";
export declare enum ConnectionStatus {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    RECONNECTING = "RECONNECTING"
}
export declare enum ConnectionEvent {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    MESSAGE = "message",
    ERROR = "error",
    RECONNECTING = "reconnecting",
    PING = "ping"
}
export type ConnectionEventCallback = () => void;
export type MessageEventCallback = (packet: WebsocketPacket) => void;
export type ErrorEventCallback = (error: Error) => void;
export type ReconnectingEventCallback = (attemptNumber: number) => void;
export type PingEventCallback = (pingTime: number) => void;
export declare class RequestTimeoutError extends Error {
    readonly nonce: number;
    constructor(message: string, nonce: number);
}
export interface RequestOptions {
    timeout?: number;
    retries?: number;
}
