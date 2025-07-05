import { Auth } from "./auth";
import { Casino } from "./casino/Casino";
import { Database } from "./db";
import { UserTable } from "./db/UserTable";
import { WalletTable } from "./db/WalletTable";
import { ClientEvent } from "./types/events";
import { WebsocketPacket } from "./types/packet";
import { GameFinishedLoadingPacket, SetSessionPacket } from "./types/packets";
import { ConnectionEvent, ConnectionStatus } from "./types/ws";
import { WebSocketClient } from "./websocket";

export type CasinoClientOptions = {
    authenticateFromLocalStorage?: boolean;
    token?: string;
    clientType?: string;
};

export class CasinoClient {
    public socket: WebSocketClient;

    public auth: Auth;
    public db: Database;
    public users: UserTable;
    public wallets: WalletTable;
    public casino: Casino;

    public session: number = Math.floor(Math.random() * 2_000_000_000);

    private wasConnected: boolean = false;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor(
        public url: string,
        public options?: CasinoClientOptions,
    ) {
        this.socket = new WebSocketClient({
            url: this.url,
            autoReconnect: true,
            debug: true,
        });

        this.socket.on(ConnectionEvent.CONNECTED, () => {
            if (!this.wasConnected) return;
            this.onConnect();
            this.emit(ClientEvent.CONNECT);
        });
        this.socket.on(ConnectionEvent.DISCONNECTED, () => {
            this.onDisconnect();
            this.emit(ClientEvent.DISCONNECT);
        });

        this.socket.on(ConnectionEvent.MESSAGE, (packet: WebsocketPacket) => {
            this.handlePacket(packet);
        });

        this.socket.on(ConnectionEvent.PING, (pingTime: number) => {
            this.casino.pingTimeStore.set(pingTime);
        });

        this.auth = new Auth(this, {
            clientType: this.options?.clientType,
            enableAuthFromLocalStorage:
                typeof options?.authenticateFromLocalStorage === "boolean"
                    ? options.authenticateFromLocalStorage
                    : true,
        });
        this.db = new Database(this);
        this.users = new UserTable(this);
        this.wallets = new WalletTable(this);
        this.casino = new Casino(this);
    }

    public async connect() {
        this.socket.connect();
        await this.waitForConnect();
        await this.onConnect();
        this.wasConnected = true;
        this.emit(ClientEvent.CONNECT);
    }

    private async onConnect() {
        this.wasConnected = true;
        if (!this.auth.isAuthenticated) {
            // Check if we should NOT authenticate from local storage
            if (
                typeof this.options?.authenticateFromLocalStorage !==
                    "boolean" ||
                this.options?.authenticateFromLocalStorage == true
            ) {
                console.log("Trying to authenticate from localstorage...");
                let success = await this.auth.authFromLocalStorage();
                if (success) {
                    console.log("Authenticated from local storage!");
                }
            }

            // Check if we should authenticate with a specific token
            if (
                !this.auth.isAuthenticated &&
                typeof this.options?.token === "string"
            ) {
                console.log("Trying to authenticate with options.token...");
                let success = await this.auth.authenticate(this.options.token);
                if (success) {
                    console.log("Authenticated from options.token!");
                }
            }
        }

        this.db.resendSubscriptions();
    }

    private async onDisconnect() {
        const wasAuthenticated = this.auth.isAuthenticated;
        //this.auth.revokeAuth();
        this.auth.isAuthenticated = false;
    }

    private async waitForConnect() {
        await new Promise<void>((resolve) => {
            if (this.socket.getStatus() === ConnectionStatus.CONNECTED) {
                resolve();
            } else {
                this.socket.on(ConnectionEvent.CONNECTED, resolve);
            }
        });
    }

    /**
     * Register an event listener
     */
    public on(event: ClientEvent, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }

        this.eventListeners.get(event)!.push(callback);
    }

    /**
     * Remove an event listener
     */
    public off(event: ClientEvent, callback: Function): void {
        if (!this.eventListeners.has(event)) return;

        const listeners = this.eventListeners.get(event)!;
        const index = listeners.indexOf(callback);

        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Emit an event to registered listeners
     */
    private emit(event: ClientEvent, ...args: any[]): void {
        if (!this.eventListeners.has(event)) return;

        for (const listener of this.eventListeners.get(event)!) {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        }
    }

    private handlePacket(packet: WebsocketPacket) {
        switch (packet.type) {
            case "db/sub:update":
                this.db.handleSubUpdatePacket(packet.payload);
                break;
            case "game/finished_loading":
                this.emit(ClientEvent.GAME_FINISHED_LOADING);
                break;
            default:
                break;
        }
    }

    public setSession(session: number) {
        this.session = session;
        this.socket.send("client/set_session", {
            sessionID: session,
        } as SetSessionPacket);
    }

    public sendGameFinishedLoading() {
        this.socket.send("game/finished_loading", {
            sessionID: this.session,
        } as GameFinishedLoadingPacket);
    }
}
