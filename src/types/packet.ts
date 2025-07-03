export interface WebsocketPacket {
    type: string;
    payload: any;
    nonce?: number;
}
