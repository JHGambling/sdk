var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseTable } from "./BaseTable";
/**
 * UserTable provides a specialized interface for interacting with user records
 */
export class UserTable extends BaseTable {
    /**
     * Creates a new UserTable instance
     *
     * @param client The CasinoClient instance
     */
    constructor(client) {
        super(client, "users");
    }
    /**
     * Get the current authenticated user's data
     *
     * @returns The current user or null if not authenticated
     */
    getCurrentUser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.auth.isAuthenticated) {
                return null;
            }
            try {
                const result = yield this.findById(this.client.auth.authenticatedAs);
                if (result.err) {
                    console.error("Error fetching current user:", result.err);
                    return null;
                }
                return result.result;
            }
            catch (error) {
                console.error("Exception fetching current user:", error);
                return null;
            }
        });
    }
}
