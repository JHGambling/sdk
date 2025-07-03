import { CasinoClient } from "./client";
import { DatabaseOperation } from "./types/db";
import {
    DatabaseOperationPacket,
    DatabaseOperationResponsePacket,
    DatabaseSubscribePacket,
    DatabaseSubUpdatePacket,
} from "./types/packets";

export type DatabaseOpResult = { result: any; err: any; exec_time_us: number };
export type DatabaseSubscription = {
    tableID: string;
    recordID: number;
    callback: (rec: DatabaseSubUpdatePacket) => any;
};

export class Database {
    public subscriptions: DatabaseSubscription[] = [];

    constructor(private client: CasinoClient) {}

    public async performOperation(
        table: string,
        operation: DatabaseOperation,
        op_id: any,
        op_data: any,
    ): Promise<DatabaseOpResult> {
        const response = (
            await this.client.socket.request("db/op", {
                table,
                operation,
                op_id,
                op_data,
            } as DatabaseOperationPacket)
        ).payload as DatabaseOperationResponsePacket;

        // Possible problem in the future (aka i dont care right now):
        // User is not authenticated yet -> operation cannot be executed -> returns just a ResponsePacket,
        // not DatabaseOperationResponsePacket

        return {
            result: response.result,
            err: response.err,
            exec_time_us: response.exec_time_us,
        };
    }

    public subscribeTable(
        tableID: string,
        callback: (rec: DatabaseSubUpdatePacket) => any,
    ) {
        this.subscribeRecord(tableID, 0, callback);
    }

    public subscribeRecord(
        tableID: string,
        recordID: number,
        callback: (rec: DatabaseSubUpdatePacket) => any,
    ) {
        this.subscriptions.push({
            tableID,
            recordID,
            callback,
        });

        try {
            this.client.socket.send("db/sub", {
                operation: "subscribe",
                tableID,
                resourceID: recordID,
            } as DatabaseSubscribePacket);
        } catch (err) {
            console.log(err);
        }
    }

    public resendSubscriptions() {
        for (var sub of this.subscriptions) {
            this.client.socket.send("db/sub", {
                operation: "subscribe",
                tableID: sub.tableID,
                resourceID: sub.recordID,
            } as DatabaseSubscribePacket);
        }
    }

    public handleSubUpdatePacket(payload: DatabaseSubUpdatePacket) {
        for (var sub of this.subscriptions) {
            if (this.matchesSubscription(sub, payload)) {
                sub.callback(payload);
            }
        }
    }

    private matchesSubscription(
        subscription: DatabaseSubscription,
        update: DatabaseSubUpdatePacket,
    ) {
        if (subscription.tableID != update.tableID) {
            return false;
        }

        if (subscription.recordID == 0) {
            return true;
        } else {
            return subscription.recordID == update.resourceID;
        }
    }
}
