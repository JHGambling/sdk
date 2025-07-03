import { Auth } from "./auth";
import { Casino } from "./casino/Casino";
import { Database } from "./db";
import { UserTable } from "./db/UserTable";
import { WalletTable } from "./db/WalletTable";
import { ClientEvent } from "./types/events";
import { WebSocketClient } from "./websocket";
export type CasinoClientOptions = {
    authenticateFromLocalStorage?: boolean;
    token?: string;
    clientType?: string;
};
export declare class CasinoClient {
    url: string;
    options?: CasinoClientOptions | undefined;
    socket: WebSocketClient;
    auth: Auth;
    db: Database;
    users: UserTable;
    wallets: WalletTable;
    casino: Casino;
    private wasConnected;
    private eventListeners;
    constructor(url: string, options?: CasinoClientOptions | undefined);
    connect(): Promise<void>;
    private onConnect;
    private onDisconnect;
    private waitForConnect;
    /**
     * Register an event listener
     */
    on(event: ClientEvent, callback: Function): void;
    /**
     * Remove an event listener
     */
    off(event: ClientEvent, callback: Function): void;
    /**
     * Emit an event to registered listeners
     */
    private emit;
    private handlePacket;
}
