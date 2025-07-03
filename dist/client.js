var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Auth } from "./auth";
import { Casino } from "./casino/Casino";
import { Database } from "./db";
import { UserTable } from "./db/UserTable";
import { WalletTable } from "./db/WalletTable";
import { ClientEvent } from "./types/events";
import { ConnectionEvent, ConnectionStatus } from "./types/ws";
import { WebSocketClient } from "./websocket";
export class CasinoClient {
    constructor(url, options) {
        var _a;
        this.url = url;
        this.options = options;
        this.wasConnected = false;
        this.eventListeners = new Map();
        this.socket = new WebSocketClient({
            url: this.url,
            autoReconnect: true,
            debug: true,
        });
        this.socket.on(ConnectionEvent.CONNECTED, () => {
            if (!this.wasConnected)
                return;
            this.onConnect();
            this.emit(ClientEvent.CONNECT);
        });
        this.socket.on(ConnectionEvent.DISCONNECTED, () => {
            this.onDisconnect();
            this.emit(ClientEvent.DISCONNECT);
        });
        this.socket.on(ConnectionEvent.MESSAGE, (packet) => {
            this.handlePacket(packet);
        });
        this.socket.on(ConnectionEvent.PING, (pingTime) => {
            this.casino.pingTimeStore.set(pingTime);
        });
        this.auth = new Auth(this, {
            clientType: (_a = this.options) === null || _a === void 0 ? void 0 : _a.clientType,
            enableAuthFromLocalStorage: typeof (options === null || options === void 0 ? void 0 : options.authenticateFromLocalStorage) === "boolean"
                ? options.authenticateFromLocalStorage
                : true
        });
        this.db = new Database(this);
        this.users = new UserTable(this);
        this.wallets = new WalletTable(this);
        this.casino = new Casino(this);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.socket.connect();
            yield this.waitForConnect();
            yield this.onConnect();
            this.wasConnected = true;
            this.emit(ClientEvent.CONNECT);
        });
    }
    onConnect() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.wasConnected = true;
            if (!this.auth.isAuthenticated) {
                // Check if we should NOT authenticate from local storage
                if (typeof ((_a = this.options) === null || _a === void 0 ? void 0 : _a.authenticateFromLocalStorage) !==
                    "boolean" ||
                    ((_b = this.options) === null || _b === void 0 ? void 0 : _b.authenticateFromLocalStorage) == true) {
                    console.log("Trying to authenticate from localstorage...");
                    let success = yield this.auth.authFromLocalStorage();
                    if (success) {
                        console.log("Authenticated from local storage!");
                    }
                }
                // Check if we should authenticate with a specific token
                if (!this.auth.isAuthenticated &&
                    typeof ((_c = this.options) === null || _c === void 0 ? void 0 : _c.token) === "string") {
                    console.log("Trying to authenticate with options.token...");
                    let success = yield this.auth.authenticate(this.options.token);
                    if (success) {
                        console.log("Authenticated from options.token!");
                    }
                }
            }
            this.db.resendSubscriptions();
        });
    }
    onDisconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const wasAuthenticated = this.auth.isAuthenticated;
            //this.auth.revokeAuth();
            this.auth.isAuthenticated = false;
        });
    }
    waitForConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => {
                if (this.socket.getStatus() === ConnectionStatus.CONNECTED) {
                    resolve();
                }
                else {
                    this.socket.on(ConnectionEvent.CONNECTED, resolve);
                }
            });
        });
    }
    /**
     * Register an event listener
     */
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
                console.error(`Error in event listener for ${event}:`, error);
            }
        }
    }
    handlePacket(packet) {
        switch (packet.type) {
            case "db/sub:update":
                this.db.handleSubUpdatePacket(packet.payload);
                break;
            default:
                break;
        }
    }
}
