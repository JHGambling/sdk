import { CasinoClient } from "../client";
import { UserModel } from "../models/UserModel";
import { CasinoStore } from "../store/index";
/**
 * User class provides simplified access to user information and operations
 */
export declare class User {
    private client;
    /**
     * Store containing the user data
     */
    readonly store: CasinoStore<UserModel>;
    /**
     * Creates a new User instance
     *
     * @param client The CasinoClient instance
     * @param userData The user data model
     */
    constructor(client: CasinoClient, userData: UserModel);
    reset(): void;
    /**
     * Get the user's ID
     */
    get id(): number;
    /**
     * Get the user's username
     */
    get username(): string;
    /**
     * Get the user's display name
     */
    get displayName(): string;
    /**
     * Get the date when the user joined
     */
    get joinedAt(): Date;
    /**
     * Check if the user is an admin
     */
    get isAdmin(): boolean;
    /**
     * Get the raw user data model
     */
    get data(): UserModel;
    /**
     * Update the user's display name
     *
     * @param newDisplayName The new display name
     * @returns A promise that resolves when the update is complete
     */
    updateDisplayName(newDisplayName: string): Promise<void>;
    /**
     * Refresh the user data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh(): Promise<void>;
}
