var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createStore } from "../store/index";
/**
 * Wallet class provides simplified access to wallet information and operations
 */
export class Wallet {
    /**
     * Creates a new Wallet instance
     *
     * @param client The CasinoClient instance
     * @param walletData The wallet data model
     */
    constructor(client, walletData) {
        this.client = client;
        this.store = createStore(walletData);
        client.db.subscribeTable("wallets", (rec) => {
            this.store.set(rec.data);
        });
    }
    /**
     * Get the wallet ID
     */
    get id() {
        return this.store.get().ID;
    }
    /**
     * Get the user ID associated with this wallet
     */
    get userId() {
        return this.store.get().UserID;
    }
    /**
     * Check if the user has received the starting bonus
     */
    get hasReceivedStartingBonus() {
        return this.store.get().ReceivedStartingBonus;
    }
    /**
     * Get the networth in cents
     */
    get networthCents() {
        return this.store.get().NetworthCents;
    }
    /**
     * Get the networth in dollars (formatted with 2 decimal places)
     */
    get networth() {
        return this.store.get().NetworthCents / 100;
    }
    /**
     * Get the raw wallet data model
     */
    get data() {
        return this.store.get();
    }
    /**
     * Update the wallet's networth
     *
     * @param newAmountCents The new networth amount in cents
     * @returns A promise that resolves when the update is complete
     */
    updateNetworth(newAmountCents) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.wallets.update(this.id, {
                NetworthCents: newAmountCents,
            });
            if (result.err) {
                throw new Error(`Failed to update networth: ${result.err}`);
            }
            // Update store data
            this.store.update((walletData) => (Object.assign(Object.assign({}, walletData), { NetworthCents: newAmountCents })));
        });
    }
    /**
     * Add funds to the wallet
     *
     * @param amountCents The amount to add in cents
     * @returns A promise that resolves when the update is complete
     */
    addFunds(amountCents) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWallet = this.store.get();
            const newAmount = currentWallet.NetworthCents + amountCents;
            yield this.updateNetworth(newAmount);
        });
    }
    /**
     * Remove funds from the wallet
     *
     * @param amountCents The amount to remove in cents
     * @returns A promise that resolves when the update is complete
     * @throws Error if the wallet doesn't have enough funds
     */
    removeFunds(amountCents) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWallet = this.store.get();
            if (currentWallet.NetworthCents < amountCents) {
                throw new Error("Insufficient funds");
            }
            const newAmount = currentWallet.NetworthCents - amountCents;
            yield this.updateNetworth(newAmount);
        });
    }
    /**
     * Mark that the user has received the starting bonus
     *
     * @returns A promise that resolves when the update is complete
     */
    markStartingBonusReceived() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.store.get().ReceivedStartingBonus) {
                return; // Already received, nothing to do
            }
            const result = yield this.client.wallets.update(this.id, {
                ReceivedStartingBonus: true,
            });
            if (result.err) {
                throw new Error(`Failed to mark starting bonus as received: ${result.err}`);
            }
            // Update store data
            this.store.update((walletData) => (Object.assign(Object.assign({}, walletData), { ReceivedStartingBonus: true })));
        });
    }
    /**
     * Refresh the wallet data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.wallets.findById(this.id);
            if (result.err) {
                throw new Error(`Failed to refresh wallet data: ${result.err}`);
            }
            this.store.set(result.result);
        });
    }
    /**
     * Format the networth as a string with currency symbol
     *
     * @param currency The currency symbol to use (default: $)
     * @returns The formatted networth string
     */
    formatNetworth(currency = "$") {
        return `${currency}${this.networth.toFixed(2)}`;
    }
    /**
     * Update the wallet with new data without creating a new instance
     *
     * @param walletData The new wallet data
     */
    updateData(walletData) {
        this.store.set(walletData);
    }
    /**
     * Reset the wallet data to defaults
     *
     * @param defaultData The default wallet data to set
     */
    resetData(defaultData) {
        this.store.set(defaultData);
    }
}
