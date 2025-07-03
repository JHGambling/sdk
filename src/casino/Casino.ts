import { CasinoClient } from "../client";
import { User } from "./User";
import { Wallet } from "./Wallet";
import { ClientEvent } from "../types/events";
import { CasinoStore, createStore } from "../store/index";
import { ConnectionStatus } from "../types/ws";

/**
 * Casino class provides a simplified interface to casino operations
 * including user management and wallet operations
 */
export class Casino {
    public user: User;
    public wallet: Wallet;

    /**
     * Store indicating whether the client is currently connected
     */
    public readonly isConnectedStore: CasinoStore<boolean> =
        createStore<boolean>(false);

    /**
     * Store indicating whether the user is currently authenticated
     */
    public readonly isAuthenticatedStore: CasinoStore<boolean> =
        createStore<boolean>(false);

    public readonly pingTimeStore: CasinoStore<number> = createStore<number>(0);

    /**
     * Creates a new Casino instance
     *
     * @param client The CasinoClient instance
     */
    constructor(private client: CasinoClient) {
        // Create default user and wallet
        const defaultUserData = {
            ID: -1,
            Username: "",
            DisplayName: "",
            IsAdmin: false,
            JoinedAt: "",
        };

        const defaultWalletData = {
            ID: -1,
            NetworthCents: 0,
            ReceivedStartingBonus: true,
            UserID: -1,
        };

        this.user = new User(this.client, defaultUserData);
        this.wallet = new Wallet(this.client, defaultWalletData);

        // Listen for authentication events to update the current user
        this.client.on(ClientEvent.AUTH_SUCCESS, async () => {
            this.isAuthenticatedStore.set(true);
            await this.refreshCurrentUser();
        });

        this.client.on(ClientEvent.AUTH_REVOKED, () => {
            this.isAuthenticatedStore.set(false);
            this.user.reset();
            // Reset wallet data without creating a new instance
            this.wallet.resetData({
                ID: -1,
                NetworthCents: 0,
                ReceivedStartingBonus: true,
                UserID: -1,
            });
        });

        // Listen for connection events
        this.client.on(ClientEvent.CONNECT, () => {
            this.isConnectedStore.set(true);
        });

        this.client.on(ClientEvent.DISCONNECT, () => {
            this.isConnectedStore.set(false);
        });

        // Initialize stores with current state
        this.isConnectedStore.set(
            this.client.socket.getStatus() === ConnectionStatus.CONNECTED,
        );
        this.isAuthenticatedStore.set(this.client.auth.isAuthenticated);
    }

    /**
     * Refreshes the current user information from the server
     *
     * @returns A promise that resolves with the current user or null if not authenticated
     */
    public async refreshCurrentUser(): Promise<User | null> {
        const userData = await this.client.users.getCurrentUser();
        if (!userData) return null;

        // Instead of creating a new User instance, update the existing one
        this.user.store.set(userData);
        await this.refreshWallet();
        return this.user;
    }

    /**
     * Refreshes the wallet information from the server
     *
     * @returns A promise that resolves with the current wallet or null if not authenticated
     */
    public async refreshWallet(): Promise<Wallet | null> {
        const walletData = await this.client.wallets.getCurrentWallet();
        if (!walletData) return null;

        // Update existing wallet instance with new data instead of creating a new one
        this.wallet.updateData(walletData);
        return this.wallet;
    }
}
