import { CasinoClient } from "../client";
import { WalletModel } from "../models/WalletModel";
import { BaseTable } from "./BaseTable";
/**
 * WalletTable provides a specialized interface for interacting with wallet records
 */
export declare class WalletTable extends BaseTable<WalletModel> {
    /**
     * Creates a new WalletTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client: CasinoClient);
    /**
     * Get the current authenticated user's wallet
     *
     * @returns The current user's wallet or null if not authenticated
     */
    getCurrentWallet(): Promise<WalletModel | null>;
}
