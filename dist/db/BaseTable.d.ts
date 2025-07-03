import { CasinoClient } from "../client";
import { DatabaseOperation } from "../types/db";
import { DatabaseOpResult } from "../db";
/**
 * BaseTable provides a generic way to interact with any table in the backend.
 * It handles the common CRUD operations and wraps the database operations.
 */
export declare class BaseTable<T> {
    client: CasinoClient;
    private tableId;
    /**
     * Creates a new BaseTable instance
     *
     * @param client The CasinoClient instance
     * @param tableId The ID of the table in the backend
     */
    constructor(client: CasinoClient, tableId: string);
    /**
     * Creates a new record in the table
     *
     * @param data The data to create
     * @returns A promise that resolves with the operation result
     */
    create(data: Partial<T>): Promise<DatabaseOpResult>;
    /**
     * Finds a record by ID
     *
     * @param id The ID of the record to find
     * @returns A promise that resolves with the operation result
     */
    findById(id: number): Promise<DatabaseOpResult>;
    /**
     * Finds all records with pagination
     *
     * @param limit Maximum number of records to return
     * @param offset Number of records to skip
     * @returns A promise that resolves with the operation result
     */
    findAll(limit?: number, offset?: number): Promise<DatabaseOpResult>;
    /**
     * Updates a record by ID
     *
     * @param id The ID of the record to update
     * @param data The data to update
     * @returns A promise that resolves with the operation result
     */
    update(id: number, data: Partial<T>): Promise<DatabaseOpResult>;
    /**
     * Deletes a record by ID
     *
     * @param id The ID of the record to delete
     * @returns A promise that resolves with the operation result
     */
    delete(id: number): Promise<DatabaseOpResult>;
    /**
     * Performs a custom operation on the table
     *
     * @param operation The operation to perform
     * @param id The operation ID parameter
     * @param data The operation data parameter
     * @returns A promise that resolves with the operation result
     */
    performOperation(operation: DatabaseOperation, id: any, data: any): Promise<DatabaseOpResult>;
}
