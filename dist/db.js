var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Database {
    constructor(client) {
        this.client = client;
        this.subscriptions = [];
    }
    performOperation(table, operation, op_id, op_data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.client.socket.request("db/op", {
                table,
                operation,
                op_id,
                op_data,
            })).payload;
            // Possible problem in the future (aka i dont care right now):
            // User is not authenticated yet -> operation cannot be executed -> returns just a ResponsePacket,
            // not DatabaseOperationResponsePacket
            return {
                result: response.result,
                err: response.err,
                exec_time_us: response.exec_time_us,
            };
        });
    }
    subscribeTable(tableID, callback) {
        this.subscribeRecord(tableID, 0, callback);
    }
    subscribeRecord(tableID, recordID, callback) {
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
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    resendSubscriptions() {
        for (var sub of this.subscriptions) {
            this.client.socket.send("db/sub", {
                operation: "subscribe",
                tableID: sub.tableID,
                resourceID: sub.recordID,
            });
        }
    }
    handleSubUpdatePacket(payload) {
        for (var sub of this.subscriptions) {
            if (this.matchesSubscription(sub, payload)) {
                sub.callback(payload);
            }
        }
    }
    matchesSubscription(subscription, update) {
        if (subscription.tableID != update.tableID) {
            return false;
        }
        if (subscription.recordID == 0) {
            return true;
        }
        else {
            return subscription.recordID == update.resourceID;
        }
    }
}
