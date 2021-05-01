/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Connection between server and client.
 */

import { MessageTypeWord } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { VSocket } from "../common/vsocket";

/**
 * Args for connection constructor.
 */
export interface CommsConnectionArgs {
	/**
	 * Actual connection.
	 */
	socket: VSocket;
}

/**
 * Common connection.
 */
export interface CommsConnection extends CommsConnectionArgs {
	/**
	 * Client UUID.
	 */
	shardUuids: Set<Uuid>;
}

/**
 * Client-server command interface.
 */
export class Envelope {
	/**
	 * Message data.
	 */
	public message: unknown;

	/**
	 * Type of the message.
	 */
	public type: MessageTypeWord;

	/**
	 * Constructor for envelope.
	 */
	public constructor({
		message,
		type
	}: {
		/**
		 * Message data to be set.
		 */
		message: unknown;

		/**
		 * Message type to be set.
		 */
		type: MessageTypeWord;
	}) {
		// Initialize private properties
		this.message = message;
		this.type = type;
	}
}
