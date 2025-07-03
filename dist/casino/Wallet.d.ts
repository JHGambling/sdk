import { CasinoClient } from "../client";
import { WalletModel } from "../models/WalletModel";
import { CasinoStore } from "../store/index";
/**
 * Wallet class provides simplified access to wallet information and operations
 */
export declare class Wallet {
    private client;
    /**
     * Store containing the wallet data
     */
    readonly store: CasinoStore<WalletModel>;
    /**
     * Creates a new Wallet instance
     *
     * @param client The CasinoClient instance
     * @param walletData The wallet data model
     */
    constructor(client: CasinoClient, walletData: WalletModel);
    /**
     * Get the wallet ID
     */
    get id(): number;
    /**
     * Get the user ID associated with this wallet
     */
    get userId(): number;
    /**
     * Check if the user has received the starting bonus
     */
    get hasReceivedStartingBonus(): boolean;
    /**
     * Get the networth in cents
     */
    get networthCents(): number;
    /**
     * Get the networth in dollars (formatted with 2 decimal places)
     */
    get networth(): number;
    /**
     * Get the raw wallet data model
     */
    get data(): WalletModel;
    /**
     * Update the wallet's networth
     *
     * @param newAmountCents The new networth amount in cents
     * @returns A promise that resolves when the update is complete
     */
    updateNetworth(newAmountCents: number): Promise<void>;
    /**
     * Add funds to the wallet
     *
     * @param amountCents The amount to add in cents
     * @returns A promise that resolves when the update is complete
     */
    addFunds(amountCents: number): Promise<void>;
    /**
     * Remove funds from the wallet
     *
     * @param amountCents The amount to remove in cents
     * @returns A promise that resolves when the update is complete
     * @throws Error if the wallet doesn't have enough funds
     */
    removeFunds(amountCents: number): Promise<void>;
    /**
     * Mark that the user has received the starting bonus
     *
     * @returns A promise that resolves when the update is complete
     */
    markStartingBonusReceived(): Promise<void>;
    /**
     * Refresh the wallet data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh(): Promise<void>;
    /**
     * Format the networth as a string with currency symbol
     *
     * @param currency The currency symbol to use (default: $)
     * @returns The formatted networth string
     */
    formatNetworth(currency?: string): string;
    /**
     * Update the wallet with new data without creating a new instance
     *
     * @param walletData The new wallet data
     */
    updateData(walletData: WalletModel): void;
    /**
     * Reset the wallet data to defaults
     *
     * @param defaultData The default wallet data to set
     */
    resetData(defaultData: WalletModel): void;
}
