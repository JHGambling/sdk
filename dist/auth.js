var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ClientEvent } from "./types/events";
export class Auth {
    constructor(client, options = {}) {
        this.client = client;
        this.options = options;
        this.isAuthenticated = false;
        this.authenticatedAs = 0;
        this.authenticationExpiresAt = new Date(0);
        this.user = null;
        this.usedToken = null;
    }
    authFromLocalStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.enableAuthFromLocalStorage)
                return false;
            let token = localStorage.getItem("casino-token");
            if (token) {
                return this.authenticate(token);
            }
            else {
                return false;
            }
        });
    }
    register(username, password, displayName) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.client.socket.request("auth/register", {
                username,
                password,
                displayName,
            })).payload;
            if (!response.success) {
                this.client["emit"](ClientEvent.AUTH_FAIL, response.userAlreadyExists
                    ? "Username already taken"
                    : "Registration failed");
                return {
                    success: false,
                    userAlreadyTaken: response.userAlreadyExists,
                };
            }
            const authSuccess = yield this.authenticate(response.token || "", this.options.clientType || "app");
            return {
                success: authSuccess,
                userAlreadyTaken: false,
            };
        });
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.client.socket.request("auth/login", {
                username,
                password,
            })).payload;
            if (!response.success) {
                this.client["emit"](ClientEvent.AUTH_FAIL, response.userDoesNotExist
                    ? "User not found"
                    : "Invalid credentials");
                return {
                    success: false,
                    userNotFound: response.userDoesNotExist,
                };
            }
            const authSuccess = yield this.authenticate(response.token || "");
            return {
                success: authSuccess,
                userNotFound: false,
            };
        });
    }
    authenticate(token, clientType = "app") {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.client.socket.request("auth/authenticate", {
                token,
                clientType
            })).payload;
            if (response.success) {
                this.isAuthenticated = true;
                this.authenticatedAs = response.userID;
                this.authenticationExpiresAt = new Date(response.expiresAt);
                if (this.options.enableAuthFromLocalStorage)
                    localStorage.setItem("casino-token", token);
                this.user = yield this.fetchUser();
                this.usedToken = token;
                this.client["emit"](ClientEvent.AUTH_SUCCESS, this.authenticatedAs);
                return true;
            }
            else {
                this.revokeAuth();
                this.usedToken = null;
                this.client["emit"](ClientEvent.AUTH_FAIL, "Authentication failed");
                return false;
            }
        });
    }
    fetchUser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated) {
                return null;
            }
            return yield this.client.users.getCurrentUser();
        });
    }
    revokeAuth() {
        console.log("Revoking auth");
        if (this.isAuthenticated) {
            this.user = null;
            this.isAuthenticated = false;
            this.authenticatedAs = -1;
            this.authenticationExpiresAt = new Date(0);
            localStorage.removeItem("casino-token");
            this.client["emit"](ClientEvent.AUTH_REVOKED);
        }
    }
    doesUserExist(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = (yield this.client.socket.request("auth/does_user_exist", {
                    username,
                })).payload;
                return response.userExists && response.success;
            }
            catch (error) {
                this.client["emit"](ClientEvent.ERROR, error instanceof Error ? error : new Error(String(error)));
                return false;
            }
        });
    }
}
