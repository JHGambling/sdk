import { CasinoClient } from "../client";
import { UserModel } from "../models/UserModel";
import { BaseTable } from "./BaseTable";
/**
 * UserTable provides a specialized interface for interacting with user records
 */
export declare class UserTable extends BaseTable<UserModel> {
    /**
     * Creates a new UserTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client: CasinoClient);
    /**
     * Get the current authenticated user's data
     *
     * @returns The current user or null if not authenticated
     */
    getCurrentUser(): Promise<UserModel | null>;
}
