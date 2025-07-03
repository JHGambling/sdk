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
 * User class provides simplified access to user information and operations
 */
export class User {
    /**
     * Creates a new User instance
     *
     * @param client The CasinoClient instance
     * @param userData The user data model
     */
    constructor(client, userData) {
        this.client = client;
        this.store = createStore(userData);
    }
    reset() {
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
    get id() {
        return this.store.get().ID;
    }
    /**
     * Get the user's username
     */
    get username() {
        return this.store.get().Username;
    }
    /**
     * Get the user's display name
     */
    get displayName() {
        return this.store.get().DisplayName;
    }
    /**
     * Get the date when the user joined
     */
    get joinedAt() {
        return new Date(this.store.get().JoinedAt);
    }
    /**
     * Check if the user is an admin
     */
    get isAdmin() {
        return this.store.get().IsAdmin;
    }
    /**
     * Get the raw user data model
     */
    get data() {
        return this.store.get();
    }
    /**
     * Update the user's display name
     *
     * @param newDisplayName The new display name
     * @returns A promise that resolves when the update is complete
     */
    updateDisplayName(newDisplayName) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.users.update(this.id, {
                DisplayName: newDisplayName,
            });
            if (result.err) {
                throw new Error(`Failed to update display name: ${result.err}`);
            }
            // Update store data
            this.store.update((userData) => (Object.assign(Object.assign({}, userData), { DisplayName: newDisplayName })));
        });
    }
    /**
     * Refresh the user data from the server
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.users.findById(this.id);
            if (result.err) {
                throw new Error(`Failed to refresh user data: ${result.err}`);
            }
            this.store.set(result.result);
        });
    }
}
