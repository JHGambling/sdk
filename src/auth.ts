import { CasinoClient } from "./client";
import { UserModel } from "./models/UserModel";
import { ClientEvent } from "./types/events";
import {
    AuthAuthenticatePacket,
    AuthAuthenticateResponsePacket,
    AuthLoginPacket,
    AuthLoginResponsePacket,
    AuthRegisterPacket,
    AuthRegisterResponsePacket,
    DoesUserExistPacket,
    DoesUserExistResponsePacket,
} from "./types/packets";

export type AuthOptions = {
    enableAuthFromLocalStorage?: boolean;
    clientType?: string; // Default to "app"    
}

export class Auth {
    public isAuthenticated: boolean = false;
    public authenticatedAs: number = 0;
    public authenticationExpiresAt: Date = new Date(0);

    public user: UserModel | null = null;

    public usedToken: string | null = null;

    constructor(
        private client: CasinoClient,
        private options: AuthOptions = {},
    ) {}

    public async authFromLocalStorage(): Promise<boolean> {
        if (!this.options.enableAuthFromLocalStorage) return false;

        let token = localStorage.getItem("casino-token");
        if (token) {
            return this.authenticate(token);
        } else {
            return false;
        }
    }

    public async register(
        username: string,
        password: string,
        displayName: string,
    ): Promise<{ success: boolean; userAlreadyTaken: boolean }> {
        const response = (
            await this.client.socket.request("auth/register", {
                username,
                password,
                displayName,
            } as AuthRegisterPacket)
        ).payload as AuthRegisterResponsePacket;

        if (!response.success) {
            this.client["emit"](
                ClientEvent.AUTH_FAIL,
                response.userAlreadyExists
                    ? "Username already taken"
                    : "Registration failed",
            );
            return {
                success: false,
                userAlreadyTaken: response.userAlreadyExists,
            };
        }

        const authSuccess = await this.authenticate(response.token || "", this.options.clientType || "app");
        return {
            success: authSuccess,
            userAlreadyTaken: false,
        };
    }

    public async login(
        username: string,
        password: string,
    ): Promise<{ success: boolean; userNotFound: boolean }> {
        const response = (
            await this.client.socket.request("auth/login", {
                username,
                password,
            } as AuthLoginPacket)
        ).payload as AuthLoginResponsePacket;

        if (!response.success) {
            this.client["emit"](
                ClientEvent.AUTH_FAIL,
                response.userDoesNotExist
                    ? "User not found"
                    : "Invalid credentials",
            );
            return {
                success: false,
                userNotFound: response.userDoesNotExist,
            };
        }

        const authSuccess = await this.authenticate(response.token || "");
        return {
            success: authSuccess,
            userNotFound: false,
        };
    }

    public async authenticate(token: string, clientType: string = "app"): Promise<boolean> {
        const response = (
            await this.client.socket.request("auth/authenticate", {
                token,
                clientType
            } as AuthAuthenticatePacket)
        ).payload as AuthAuthenticateResponsePacket;

        if (response.success) {
            this.isAuthenticated = true;
            this.authenticatedAs = response.userID;
            this.authenticationExpiresAt = new Date(response.expiresAt);
            if (this.options.enableAuthFromLocalStorage)
                localStorage.setItem("casino-token", token);

            this.user = await this.fetchUser();

            this.usedToken = token;
            this.client["emit"](ClientEvent.AUTH_SUCCESS, this.authenticatedAs);
            return true;
        } else {
            this.revokeAuth();
            this.usedToken = null;
            this.client["emit"](ClientEvent.AUTH_FAIL, "Authentication failed");
            return false;
        }
    }

    public async fetchUser(): Promise<UserModel | null> {
        if (!this.isAuthenticated) {
            return null;
        }

        return await this.client.users.getCurrentUser();
    }

    public revokeAuth() {
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

    public async doesUserExist(username: string): Promise<boolean> {
        try {
            const response = (
                await this.client.socket.request("auth/does_user_exist", {
                    username,
                } as DoesUserExistPacket)
            ).payload as DoesUserExistResponsePacket;

            return response.userExists && response.success;
        } catch (error) {
            this.client["emit"](
                ClientEvent.ERROR,
                error instanceof Error ? error : new Error(String(error)),
            );
            return false;
        }
    }
}
