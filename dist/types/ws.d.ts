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
export declare type ConnectionEventCallback = () => void;
export declare type MessageEventCallback = (packet: WebsocketPacket) => void;
export declare type ErrorEventCallback = (error: Error) => void;
export declare type ReconnectingEventCallback = (attemptNumber: number) => void;
export declare type PingEventCallback = (pingTime: number) => void;
export declare class RequestTimeoutError extends Error {
    readonly nonce: number;
    constructor(message: string, nonce: number);
}
export interface RequestOptions {
    timeout?: number;
    retries?: number;
}
