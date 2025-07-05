export declare type ResponsePacket = {
    success: boolean;
    status: string;
    message: string;
};
export declare type AuthRegisterPacket = {
    username: string;
    displayName: string;
    password: string;
};
export declare type AuthRegisterResponsePacket = ResponsePacket & {
    userAlreadyExists: boolean;
    token?: string;
};
export declare type AuthLoginPacket = {
    username: string;
    password: string;
};
export declare type AuthLoginResponsePacket = ResponsePacket & {
    userDoesNotExist: boolean;
    token?: string;
};
export declare type AuthAuthenticatePacket = {
    token: string;
    clientType: string;
};
export declare type AuthAuthenticateResponsePacket = ResponsePacket & {
    userID: number;
    expiresAt: number;
};
export declare type DoesUserExistPacket = {
    username: string;
};
export declare type DoesUserExistResponsePacket = ResponsePacket & {
    userExists: boolean;
};
export declare type DatabaseOperationPacket = {
    operation: string;
    table: string;
    op_id: any;
    op_data: any;
};
export declare type DatabaseOperationResponsePacket = {
    op: DatabaseOperationPacket;
    result: any;
    err: any;
    exec_time_us: number;
};
export declare type DatabaseSubscribePacket = {
    operation: string;
    tableID: string;
    resourceID: number;
};
export declare type DatabaseSubUpdatePacket = {
    tableID: string;
    resourceID: any;
    op: string;
    data: any;
};
export declare type SetSessionPacket = {
    sessionID: number;
};
export declare type GameFinishedLoadingPacket = {
    sessionID: number;
};
