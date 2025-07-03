import { CasinoClient } from "../client";
import { DatabaseOperation } from "../types/db";
import { DatabaseOpResult } from "../db";

/**
 * BaseTable provides a generic way to interact with any table in the backend.
 * It handles the common CRUD operations and wraps the database operations.
 */
export class BaseTable<T> {
    /**
     * Creates a new BaseTable instance
     *
     * @param client The CasinoClient instance
     * @param tableId The ID of the table in the backend
     */
    constructor(
        public client: CasinoClient,
        private tableId: string,
    ) {}

    /**
     * Creates a new record in the table
     *
     * @param data The data to create
     * @returns A promise that resolves with the operation result
     */
    public async create(data: Partial<T>): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            "create",
            null,
            data,
        );
    }

    /**
     * Finds a record by ID
     *
     * @param id The ID of the record to find
     * @returns A promise that resolves with the operation result
     */
    public async findById(id: number): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            "findByID",
            id,
            null,
        );
    }

    /**
     * Finds all records with pagination
     *
     * @param limit Maximum number of records to return
     * @param offset Number of records to skip
     * @returns A promise that resolves with the operation result
     */
    public async findAll(
        limit: number = 10,
        offset: number = 0,
    ): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            "findAll",
            limit,
            offset,
        );
    }

    /**
     * Updates a record by ID
     *
     * @param id The ID of the record to update
     * @param data The data to update
     * @returns A promise that resolves with the operation result
     */
    public async update(
        id: number,
        data: Partial<T>,
    ): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            "update",
            id,
            data,
        );
    }

    /**
     * Deletes a record by ID
     *
     * @param id The ID of the record to delete
     * @returns A promise that resolves with the operation result
     */
    public async delete(id: number): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            "delete",
            id,
            null,
        );
    }

    /**
     * Performs a custom operation on the table
     *
     * @param operation The operation to perform
     * @param id The operation ID parameter
     * @param data The operation data parameter
     * @returns A promise that resolves with the operation result
     */
    public async performOperation(
        operation: DatabaseOperation,
        id: any,
        data: any,
    ): Promise<DatabaseOpResult> {
        return this.client.db.performOperation(
            this.tableId,
            operation,
            id,
            data,
        );
    }
}
