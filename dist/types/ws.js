// Connection status enum
export var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["DISCONNECTED"] = "DISCONNECTED";
    ConnectionStatus["CONNECTING"] = "CONNECTING";
    ConnectionStatus["CONNECTED"] = "CONNECTED";
    ConnectionStatus["RECONNECTING"] = "RECONNECTING";
})(ConnectionStatus || (ConnectionStatus = {}));
// Connection events
export var ConnectionEvent;
(function (ConnectionEvent) {
    ConnectionEvent["CONNECTED"] = "connected";
    ConnectionEvent["DISCONNECTED"] = "disconnected";
    ConnectionEvent["MESSAGE"] = "message";
    ConnectionEvent["ERROR"] = "error";
    ConnectionEvent["RECONNECTING"] = "reconnecting";
    ConnectionEvent["PING"] = "ping";
})(ConnectionEvent || (ConnectionEvent = {}));
// Request timeout error
export class RequestTimeoutError extends Error {
    constructor(message, nonce) {
        super(message);
        this.nonce = nonce;
        this.name = "RequestTimeoutError";
    }
}
