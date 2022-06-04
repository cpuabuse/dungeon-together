/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Connection between server and client.
 */

import { MessageTypeWord } from "../../common/defaults/connection";
import { Uuid } from "../../common/uuid";
import { CoreUniverseInstanceNonRecursive } from "../universe";
import { VSocket } from "./vsocket";

/**
 * Args for connection constructor.
 */
export interface CoreConnectionParam<U extends CoreUniverseInstanceNonRecursive> {
	/**
	 * Actual connection.
	 */
	socket: VSocket<U>;
}

/**
 * Common connection.
 */
export interface CoreConnection<U extends CoreUniverseInstanceNonRecursive> extends CoreConnectionParam<U> {
	/**
	 * Client UUID.
	 */
	shardUuids: Set<Uuid>;
}

/**
 * Client-server command interface.
 */
export class Message {
	/**
	 * Message data.
	 */
	public body: unknown;

	/**
	 * Type of the message.
	 */
	public type: MessageTypeWord;

	/**
	 * Constructor for message.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		body,
		type
	}: {
		/**
		 * Message data to be set.
		 */
		body: unknown;

		/**
		 * Message type to be set.
		 */
		type: MessageTypeWord;
	}) {
		// Initialize private properties
		this.body = body;
		this.type = type;
	}
}

/**
 * Envelope, a single transaction.
 */
export class Envelope {
	/**
	 * Message array.
	 */
	public messages: Array<Message> = new Array<Message>();

	/**
	 * Constructor for envelope.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		messages
	}: {
		/**
		 * Optional messages to be set.
		 */
		messages?: Array<Message>;
	}) {
		if (typeof messages !== "undefined") {
			messages.forEach(message => {
				this.messages.push(message);
			});
		}
	}
}
