import { WalletModel } from "./WalletModel";

export type UserModel = {
    ID: number;
    Username: string;
    DisplayName: string;
    JoinedAt: string;
    IsAdmin: boolean;
    Wallet?: WalletModel;
    CreatedAt?: string;
    UpdatedAt?: string;
};
