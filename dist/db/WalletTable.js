var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseTable } from "./BaseTable";
/**
 * WalletTable provides a specialized interface for interacting with wallet records
 */
export class WalletTable extends BaseTable {
    /**
     * Creates a new WalletTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client) {
        super(client, "wallets");
    }
    /**
     * Get the current authenticated user's wallet
     *
     * @returns The current user's wallet or null if not authenticated
     */
    getCurrentWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.auth.isAuthenticated || !this.client.auth.user) {
                return null;
            }
            // If the user already has the wallet loaded
            if (this.client.auth.user.Wallet) {
                return this.client.auth.user.Wallet;
            }
            try {
                // Use a custom operation that searches for a wallet by user ID
                // We'll use findAll and then filter on the client side
                const result = yield this.findAll(100, 0);
                if (result.err) {
                    console.error("Error fetching current wallet:", result.err);
                    return null;
                }
                // Filter the results to find the wallet belonging to the current user
                if (Array.isArray(result.result)) {
                    const userWallet = result.result.find((wallet) => wallet.UserID === this.client.auth.authenticatedAs);
                    return userWallet || null;
                }
                return null;
            }
            catch (error) {
                console.error("Exception fetching current wallet:", error);
                return null;
            }
        });
    }
}
