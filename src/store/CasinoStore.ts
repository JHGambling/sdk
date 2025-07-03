// Import from local svelte installation
// @ts-ignore - Path resolution handled by build system
import { writable, type Writable, get } from "svelte/store";

/**
 * Type for Svelte's writable store
 */
type SvelteWritable<T> = Writable<T>;

/**
 * A reactive store implementation that works with both vanilla JavaScript and Svelte
 *
 * This store follows the Svelte store contract and has the same API shape as Svelte's
 * writable store, making it directly usable in Svelte components with the $ prefix.
 */
export class CasinoStore<T> implements Writable<T> {
    private value: T;
    private subscribers: Set<(value: T) => void> = new Set();

    /**
     * The official Svelte writable store
     * This allows direct use in Svelte components with the $ prefix
     */
    public readonly svelte: SvelteWritable<T>;

    /**
     * Creates a new store with the given initial value
     *
     * @param initialValue The initial value of the store
     */
    constructor(initialValue: T) {
        this.value = initialValue;

        // Create a Svelte writable store with the same initial value
        this.svelte = writable(initialValue);

        // Create a two-way sync between our custom store and the Svelte store
        // When our store changes, update the Svelte store
        this.subscribe((value) => {
            this.svelte.set(value);
        });

        // When the Svelte store changes, update our store
        this.svelte.subscribe((value: T) => {
            if (this.value !== value) {
                this.value = value;
                this.notifyExcept(this.svelte);
            }
        });
    }

    /**
     * Get the current value
     */
    public get(): T {
        return this.value;
    }

    /**
     * Set a new value and notify all subscribers
     *
     * @param newValue The new value to set
     */
    public set(newValue: T): void {
        if (this.value === newValue) return;
        this.value = newValue;
        this.notify();
    }

    /**
     * Update the store value using a callback function
     *
     * @param updater Function that takes the current value and returns a new value
     */
    public update(updater: (value: T) => T): void {
        this.set(updater(this.value));

        // Also update the Svelte store directly
        this.svelte.update(updater);
    }

    /**
     * Add a subscriber to be notified when the value changes
     *
     * @param subscriber Function to call when the value changes
     * @returns Unsubscribe function
     */
    public subscribe(subscriber: (value: T) => void): () => void {
        this.subscribers.add(subscriber);

        // Call the subscriber immediately with the current value
        // (This matches Svelte's store behavior)
        subscriber(this.value);

        // Return an unsubscribe function
        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    /**
     * Force notify all subscribers with the current value
     */
    public notify(): void {
        for (const subscriber of this.subscribers) {
            subscriber(this.value);
        }
    }

    /**
     * Notify all subscribers except the one provided
     * Used to prevent circular updates between stores
     */
    private notifyExcept(except: any): void {
        for (const subscriber of this.subscribers) {
            if (subscriber !== except) {
                subscriber(this.value);
            }
        }
    }

    /**
     * Create a derived store that depends on this store
     *
     * @param deriveFn Function that derives a new value from the original
     * @returns A new store with the derived value
     */
    public derived<U>(deriveFn: (value: T) => U): CasinoStore<U> {
        const derivedStore = new CasinoStore<U>(deriveFn(this.value));

        this.subscribe((value) => {
            derivedStore.set(deriveFn(value));
        });

        return derivedStore;
    }
}

/**
 * Check if an object is a valid Svelte store (has a subscribe method)
 */
export function isStore<T>(
    obj: any,
): obj is { subscribe: (subscriber: (value: T) => void) => () => void } {
    return obj && typeof obj.subscribe === "function";
}

/**
 * Get the current value of a store without subscribing to it
 * Mimics Svelte's get function
 */
export function getValue<T>(store: CasinoStore<T>): T {
    return store.get();
}

/**
 * Get the current value of any store
 * Works with both CasinoStore and Svelte stores
 */
export function getStoreValue<T>(
    store: { subscribe: Function } | CasinoStore<T>,
): T {
    if (store instanceof CasinoStore) {
        return store.get();
    }
    return get(store as Writable<T>);
}

/**
 * Creates a new CasinoStore with the given initial value
 *
 * @param initialValue The initial value
 * @returns A new store
 */
export function createStore<T>(initialValue: T): CasinoStore<T> {
    return new CasinoStore<T>(initialValue);
}
