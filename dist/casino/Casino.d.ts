import { CasinoClient } from "../client";
import { User } from "./User";
import { Wallet } from "./Wallet";
import { CasinoStore } from "../store/index";
/**
 * Casino class provides a simplified interface to casino operations
 * including user management and wallet operations
 */
export declare class Casino {
    private client;
    user: User;
    wallet: Wallet;
    /**
     * Store indicating whether the client is currently connected
     */
    readonly isConnectedStore: CasinoStore<boolean>;
    /**
     * Store indicating whether the user is currently authenticated
     */
    readonly isAuthenticatedStore: CasinoStore<boolean>;
    readonly pingTimeStore: CasinoStore<number>;
    /**
     * Creates a new Casino instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client: CasinoClient);
    /**
     * Refreshes the current user information from the server
     *
     * @returns A promise that resolves with the current user or null if not authenticated
     */
    refreshCurrentUser(): Promise<User | null>;
    /**
     * Refreshes the wallet information from the server
     *
     * @returns A promise that resolves with the current wallet or null if not authenticated
     */
    refreshWallet(): Promise<Wallet | null>;
}
