import { CasinoClient } from "./client";
import { UserModel } from "./models/UserModel";
export type AuthOptions = {
    enableAuthFromLocalStorage?: boolean;
    clientType?: string;
};
export declare class Auth {
    private client;
    private options;
    isAuthenticated: boolean;
    authenticatedAs: number;
    authenticationExpiresAt: Date;
    user: UserModel | null;
    usedToken: string | null;
    constructor(client: CasinoClient, options?: AuthOptions);
    authFromLocalStorage(): Promise<boolean>;
    register(username: string, password: string, displayName: string): Promise<{
        success: boolean;
        userAlreadyTaken: boolean;
    }>;
    login(username: string, password: string): Promise<{
        success: boolean;
        userNotFound: boolean;
    }>;
    authenticate(token: string, clientType?: string): Promise<boolean>;
    fetchUser(): Promise<UserModel | null>;
    revokeAuth(): void;
    doesUserExist(username: string): Promise<boolean>;
}
