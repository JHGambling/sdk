var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "./User";
import { Wallet } from "./Wallet";
import { ClientEvent } from "../types/events";
import { createStore } from "../store/index";
import { ConnectionStatus } from "../types/ws";
/**
 * Casino class provides a simplified interface to casino operations
 * including user management and wallet operations
 */
export class Casino {
    /**
     * Creates a new Casino instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client) {
        this.client = client;
        /**
         * Store indicating whether the client is currently connected
         */
        this.isConnectedStore = createStore(false);
        /**
         * Store indicating whether the user is currently authenticated
         */
        this.isAuthenticatedStore = createStore(false);
        this.pingTimeStore = createStore(0);
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
        this.client.on(ClientEvent.AUTH_SUCCESS, () => __awaiter(this, void 0, void 0, function* () {
            this.isAuthenticatedStore.set(true);
            yield this.refreshCurrentUser();
        }));
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
        this.isConnectedStore.set(this.client.socket.getStatus() === ConnectionStatus.CONNECTED);
        this.isAuthenticatedStore.set(this.client.auth.isAuthenticated);
    }
    /**
     * Refreshes the current user information from the server
     *
     * @returns A promise that resolves with the current user or null if not authenticated
     */
    refreshCurrentUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield this.client.users.getCurrentUser();
            if (!userData)
                return null;
            // Instead of creating a new User instance, update the existing one
            this.user.store.set(userData);
            yield this.refreshWallet();
            return this.user;
        });
    }
    /**
     * Refreshes the wallet information from the server
     *
     * @returns A promise that resolves with the current wallet or null if not authenticated
     */
    refreshWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const walletData = yield this.client.wallets.getCurrentWallet();
            if (!walletData)
                return null;
            // Update existing wallet instance with new data instead of creating a new one
            this.wallet.updateData(walletData);
            return this.wallet;
        });
    }
}
