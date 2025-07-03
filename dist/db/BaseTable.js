var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * BaseTable provides a generic way to interact with any table in the backend.
 * It handles the common CRUD operations and wraps the database operations.
 */
export class BaseTable {
    /**
     * Creates a new BaseTable instance
     *
     * @param client The CasinoClient instance
     * @param tableId The ID of the table in the backend
     */
    constructor(client, tableId) {
        this.client = client;
        this.tableId = tableId;
    }
    /**
     * Creates a new record in the table
     *
     * @param data The data to create
     * @returns A promise that resolves with the operation result
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, "create", null, data);
        });
    }
    /**
     * Finds a record by ID
     *
     * @param id The ID of the record to find
     * @returns A promise that resolves with the operation result
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, "findByID", id, null);
        });
    }
    /**
     * Finds all records with pagination
     *
     * @param limit Maximum number of records to return
     * @param offset Number of records to skip
     * @returns A promise that resolves with the operation result
     */
    findAll(limit = 10, offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, "findAll", limit, offset);
        });
    }
    /**
     * Updates a record by ID
     *
     * @param id The ID of the record to update
     * @param data The data to update
     * @returns A promise that resolves with the operation result
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, "update", id, data);
        });
    }
    /**
     * Deletes a record by ID
     *
     * @param id The ID of the record to delete
     * @returns A promise that resolves with the operation result
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, "delete", id, null);
        });
    }
    /**
     * Performs a custom operation on the table
     *
     * @param operation The operation to perform
     * @param id The operation ID parameter
     * @param data The operation data parameter
     * @returns A promise that resolves with the operation result
     */
    performOperation(operation, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.db.performOperation(this.tableId, operation, id, data);
        });
    }
}
