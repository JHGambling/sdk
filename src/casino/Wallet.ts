import { CasinoClient } from "../client";
import { WalletModel } from "../models/WalletModel";
import { CasinoStore, createStore } from "../store/index";

/**
 * Wallet class provides simplified access to wallet information and operations
 */
export class Wallet {
    /**
     * Store containing the wallet data
     */
    public readonly store: CasinoStore<WalletModel>;

    /**
     * Creates a new Wallet instance
     *
     * @param client The CasinoClient instance
     * @param walletData The wallet data model
     */
    constructor(
        private client: CasinoClient,
        walletData: WalletModel,
    ) {
        this.store = createStore<WalletModel>(walletData);

        client.db.subscribeTable("wallets", (rec) => {
            this.store.set(rec.data);
        });
    }

    /**
     * Get the wallet ID
     */
    public get id(): number {
        return this.store.get().ID;
    }

    /**
     * Get the user ID associated with this wallet
     */
    public get userId(): number {
        return this.store.get().UserID;
    }

    /**
     * Check if the user has received the starting bonus
     */
    public get hasReceivedStartingBonus(): boolean {
        return this.store.get().ReceivedStartingBonus;
    }

    /**
     * Get the networth in cents
     */
    public get networthCents(): number {
        return this.store.get().NetworthCents;
    }

    /**
     * Get the networth in dollars (formatted with 2 decimal places)
     */
    public get networth(): number {
        return this.store.get().NetworthCents / 100;
    }

    /**
     * Get the raw wallet data model
     */
    public get data(): WalletModel {
        return this.store.get();
    }

    /**
     * Update the wallet's networth
     *
     * @param newAmountCents The new networth amount in cents
     * @returns A promise that resolves when the update is complete
     */
    public async updateNetworth(newAmountCents: number): Promise<void> {
        const result = await this.client.wallets.update(this.id, {
            NetworthCents: newAmountCents,
        });

        if (result.err) {
            throw new Error(`Failed to update networth: ${result.err}`);
        }

        // Update store data
        this.store.update((walletData: WalletModel) => ({
            ...walletData,
            NetworthCents: newAmountCents,
        }));
    }

    /**
     * Add funds to the wallet
     *
     * @param amountCents The amount to add in cents
     * @returns A promise that resolves when the update is complete
     */
    public async addFunds(amountCents: number): Promise<void> {
        const currentWallet = this.store.get();
        const newAmount = currentWallet.NetworthCents + amountCents;
        await this.updateNetworth(newAmount);
    }

    /**
     * Remove funds from the wallet
     *
     * @param amountCents The amount to remove in cents
     * @returns A promise that resolves when the update is complete
     * @throws Error if the wallet doesn't have enough funds
     */
    public async removeFunds(amountCents: number): Promise<void> {
        const currentWallet = this.store.get();
        if (currentWallet.NetworthCents < amountCents) {
            throw new Error("Insufficient funds");
        }

        const newAmount = currentWallet.NetworthCents - amountCents;
        await this.updateNetworth(newAmount);
    }

    /**
     * Mark that the user has received the starting bonus
     *
     * @returns A promise that resolves when the update is complete
     */
    public async markStartingBonusReceived(): Promise<void> {
        if (this.store.get().ReceivedStartingBonus) {
            return; // Already received, nothing to do
        }

        const result = await this.client.wallets.update(this.id, {
            ReceivedStartingBonus: true,
        });

        if (result.err) {
            throw new Error(
                `Failed to mark starting bonus as received: ${result.err}`,
            );
        }

        // Update store data
        this.store.update((walletData: WalletModel) => ({
            ...walletData,
            ReceivedStartingBonus: true,
        }));
    }

    /**
     * Refresh the wallet data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    public async refresh(): Promise<void> {
        const result = await this.client.wallets.findById(this.id);
        if (result.err) {
            throw new Error(`Failed to refresh wallet data: ${result.err}`);
        }

        this.store.set(result.result as WalletModel);
    }

    /**
     * Format the networth as a string with currency symbol
     *
     * @param currency The currency symbol to use (default: $)
     * @returns The formatted networth string
     */
    public formatNetworth(currency: string = "$"): string {
        return `${currency}${this.networth.toFixed(2)}`;
    }

    /**
     * Update the wallet with new data without creating a new instance
     *
     * @param walletData The new wallet data
     */
    public updateData(walletData: WalletModel): void {
        this.store.set(walletData);
    }

    /**
     * Reset the wallet data to defaults
     *
     * @param defaultData The default wallet data to set
     */
    public resetData(defaultData: WalletModel): void {
        this.store.set(defaultData);
    }
}
