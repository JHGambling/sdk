import { WebsocketPacket } from "../types/packet";

/**
 * Creates a formatted packet to send to the server
 * @param type The packet type
 * @param payload The packet payload
 * @param nonce Optional nonce value (will be generated if not provided)
 * @returns The formatted packet
 */
export function createPacket(
    type: string,
    payload: any = {},
    nonce?: number,
): WebsocketPacket {
    return {
        type,
        payload,
        nonce: nonce !== undefined ? nonce : Date.now(),
    };
}

/**
 * Parse a JSON string into a WebsocketPacket
 * @param data The JSON string to parse
 * @returns The parsed packet
 */
export function parsePacket(data: string): WebsocketPacket {
    try {
        return JSON.parse(data) as WebsocketPacket;
    } catch (error) {
        throw new Error("Failed to parse packet: Invalid JSON");
    }
}

/**
 * Creates a request packet with a specific nonce
 * @param type The packet type
 * @param payload The packet payload
 * @param nonce The nonce value
 * @returns The formatted request packet
 */
export function createRequestPacket(
    type: string,
    payload: any = {},
    nonce: number,
): WebsocketPacket {
    return {
        type,
        payload,
        nonce,
    };
}

/**
 * Creates a response packet that matches a request nonce
 * @param type The response packet type
 * @param payload The response payload
 * @param requestNonce The nonce from the original request
 * @returns The formatted response packet
 */
export function createResponsePacket(
    type: string,
    payload: any = {},
    requestNonce: number,
): WebsocketPacket {
    return {
        type,
        payload,
        nonce: requestNonce,
    };
}

/**
 * Check if a packet is a response to a specific request
 * @param packet The packet to check
 * @param requestNonce The nonce of the original request
 * @returns True if the packet is a response to the request
 */
export function isResponseToRequest(
    packet: WebsocketPacket,
    requestNonce: number,
): boolean {
    return packet.nonce === requestNonce;
}

/**
 * Extract the nonce from a packet, or return null if not present
 * @param packet The packet to extract nonce from
 * @returns The nonce value or null
 */
export function extractNonce(packet: WebsocketPacket): number | null {
    return packet.nonce || null;
}
