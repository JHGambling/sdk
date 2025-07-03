import { CasinoClient } from "../client";
import { WalletModel } from "../models/WalletModel";
import { BaseTable } from "./BaseTable";

/**
 * WalletTable provides a specialized interface for interacting with wallet records
 */
export class WalletTable extends BaseTable<WalletModel> {
    /**
     * Creates a new WalletTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client: CasinoClient) {
        super(client, "wallets");
    }

    /**
     * Get the current authenticated user's wallet
     *
     * @returns The current user's wallet or null if not authenticated
     */
    public async getCurrentWallet(): Promise<WalletModel | null> {
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
            const result = await this.findAll(100, 0);

            if (result.err) {
                console.error("Error fetching current wallet:", result.err);
                return null;
            }

            // Filter the results to find the wallet belonging to the current user
            if (Array.isArray(result.result)) {
                const userWallet = result.result.find(
                    (wallet: WalletModel) =>
                        wallet.UserID === this.client.auth.authenticatedAs,
                );

                return userWallet || null;
            }

            return null;
        } catch (error) {
            console.error("Exception fetching current wallet:", error);
            return null;
        }
    }
}
