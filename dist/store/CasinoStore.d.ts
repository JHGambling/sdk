import { type Writable } from "svelte/store";
/**
 * Type for Svelte's writable store
 */
declare type SvelteWritable<T> = Writable<T>;
/**
 * A reactive store implementation that works with both vanilla JavaScript and Svelte
 *
 * This store follows the Svelte store contract and has the same API shape as Svelte's
 * writable store, making it directly usable in Svelte components with the $ prefix.
 */
export declare class CasinoStore<T> implements Writable<T> {
    private value;
    private subscribers;
    /**
     * The official Svelte writable store
     * This allows direct use in Svelte components with the $ prefix
     */
    readonly svelte: SvelteWritable<T>;
    /**
     * Creates a new store with the given initial value
     *
     * @param initialValue The initial value of the store
     */
    constructor(initialValue: T);
    /**
     * Get the current value
     */
    get(): T;
    /**
     * Set a new value and notify all subscribers
     *
     * @param newValue The new value to set
     */
    set(newValue: T): void;
    /**
     * Update the store value using a callback function
     *
     * @param updater Function that takes the current value and returns a new value
     */
    update(updater: (value: T) => T): void;
    /**
     * Add a subscriber to be notified when the value changes
     *
     * @param subscriber Function to call when the value changes
     * @returns Unsubscribe function
     */
    subscribe(subscriber: (value: T) => void): () => void;
    /**
     * Force notify all subscribers with the current value
     */
    notify(): void;
    /**
     * Notify all subscribers except the one provided
     * Used to prevent circular updates between stores
     */
    private notifyExcept;
    /**
     * Create a derived store that depends on this store
     *
     * @param deriveFn Function that derives a new value from the original
     * @returns A new store with the derived value
     */
    derived<U>(deriveFn: (value: T) => U): CasinoStore<U>;
}
/**
 * Check if an object is a valid Svelte store (has a subscribe method)
 */
export declare function isStore<T>(obj: any): obj is {
    subscribe: (subscriber: (value: T) => void) => () => void;
};
/**
 * Get the current value of a store without subscribing to it
 * Mimics Svelte's get function
 */
export declare function getValue<T>(store: CasinoStore<T>): T;
/**
 * Get the current value of any store
 * Works with both CasinoStore and Svelte stores
 */
export declare function getStoreValue<T>(store: {
    subscribe: Function;
} | CasinoStore<T>): T;
/**
 * Creates a new CasinoStore with the given initial value
 *
 * @param initialValue The initial value
 * @returns A new store
 */
export declare function createStore<T>(initialValue: T): CasinoStore<T>;
export {};
