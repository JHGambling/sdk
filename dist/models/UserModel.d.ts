import { WalletModel } from "./WalletModel";
export declare type UserModel = {
    ID: number;
    Username: string;
    DisplayName: string;
    JoinedAt: string;
    IsAdmin: boolean;
    Wallet?: WalletModel;
    CreatedAt?: string;
    UpdatedAt?: string;
};
