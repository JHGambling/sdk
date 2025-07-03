import { CasinoClient } from "./client";
import { DatabaseOperation } from "./types/db";
import { DatabaseSubUpdatePacket } from "./types/packets";
export type DatabaseOpResult = {
    result: any;
    err: any;
    exec_time_us: number;
};
export type DatabaseSubscription = {
    tableID: string;
    recordID: number;
    callback: (rec: DatabaseSubUpdatePacket) => any;
};
export declare class Database {
    private client;
    subscriptions: DatabaseSubscription[];
    constructor(client: CasinoClient);
    performOperation(table: string, operation: DatabaseOperation, op_id: any, op_data: any): Promise<DatabaseOpResult>;
    subscribeTable(tableID: string, callback: (rec: DatabaseSubUpdatePacket) => any): void;
    subscribeRecord(tableID: string, recordID: number, callback: (rec: DatabaseSubUpdatePacket) => any): void;
    resendSubscriptions(): void;
    handleSubUpdatePacket(payload: DatabaseSubUpdatePacket): void;
    private matchesSubscription;
}
