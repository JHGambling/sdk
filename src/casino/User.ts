import { CasinoClient } from "../client";
import { UserModel } from "../models/UserModel";
import { CasinoStore, createStore } from "../store/index";

/**
 * User class provides simplified access to user information and operations
 */
export class User {
    /**
     * Store containing the user data
     */
    public readonly store: CasinoStore<UserModel>;

    /**
     * Creates a new User instance
     *
     * @param client The CasinoClient instance
     * @param userData The user data model
     */
    constructor(
        private client: CasinoClient,
        userData: UserModel,
    ) {
        this.store = createStore<UserModel>(userData);
    }

    public reset() {
        this.store.set({
            ID: -1,
            Username: "",
            DisplayName: "",
            IsAdmin: false,
            JoinedAt: "",
        });
    }

    /**
     * Get the user's ID
     */
    public get id(): number {
        return this.store.get().ID;
    }

    /**
     * Get the user's username
     */
    public get username(): string {
        return this.store.get().Username;
    }

    /**
     * Get the user's display name
     */
    public get displayName(): string {
        return this.store.get().DisplayName;
    }

    /**
     * Get the date when the user joined
     */
    public get joinedAt(): Date {
        return new Date(this.store.get().JoinedAt);
    }

    /**
     * Check if the user is an admin
     */
    public get isAdmin(): boolean {
        return this.store.get().IsAdmin;
    }

    /**
     * Get the raw user data model
     */
    public get data(): UserModel {
        return this.store.get();
    }

    /**
     * Update the user's display name
     *
     * @param newDisplayName The new display name
     * @returns A promise that resolves when the update is complete
     */
    public async updateDisplayName(newDisplayName: string): Promise<void> {
        const result = await this.client.users.update(this.id, {
            DisplayName: newDisplayName,
        });

        if (result.err) {
            throw new Error(`Failed to update display name: ${result.err}`);
        }

        // Update store data
        this.store.update((userData: UserModel) => ({
            ...userData,
            DisplayName: newDisplayName,
        }));
    }

    /**
     * Refresh the user data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    public async refresh(): Promise<void> {
        const result = await this.client.users.findById(this.id);
        if (result.err) {
            throw new Error(`Failed to refresh user data: ${result.err}`);
        }

        this.store.set(result.result as UserModel);
    }
}
