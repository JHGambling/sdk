/**
 * SDK Client Events
 */
export enum ClientEvent {
  // Connection events
  CONNECT = "connect",
  DISCONNECT = "disconnect",

  // Authentication events
  AUTH_SUCCESS = "auth:success",
  AUTH_FAIL = "auth:fail",
  AUTH_REVOKED = "auth:revoked",

  // Error event
  ERROR = "error"
}

// Simple event handler type
export type EventHandler = (...args: any[]) => void;
