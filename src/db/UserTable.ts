import { CasinoClient } from "../client";
import { UserModel } from "../models/UserModel";
import { BaseTable } from "./BaseTable";

/**
 * UserTable provides a specialized interface for interacting with user records
 */
export class UserTable extends BaseTable<UserModel> {
    /**
     * Creates a new UserTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client: CasinoClient) {
        super(client, "users");
    }

    /**
     * Get the current authenticated user's data
     *
     * @returns The current user or null if not authenticated
     */
    public async getCurrentUser(): Promise<UserModel | null> {
        if (!this.client.auth.isAuthenticated) {
            return null;
        }

        try {
            const result = await this.findById(
                this.client.auth.authenticatedAs,
            );
            if (result.err) {
                console.error("Error fetching current user:", result.err);
                return null;
            }

            return result.result as UserModel;
        } catch (error) {
            console.error("Exception fetching current user:", error);
            return null;
        }
    }
}
