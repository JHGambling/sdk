/**
 * SDK Client Events
 */
export declare enum ClientEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTH_SUCCESS = "auth:success",
    AUTH_FAIL = "auth:fail",
    AUTH_REVOKED = "auth:revoked",
    ERROR = "error"
}
export type EventHandler = (...args: any[]) => void;
