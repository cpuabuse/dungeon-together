/*
	Copyright 2023 cpuabuse.com
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
 * Constructor params for connection.
 */
export type CoreConnectionConstructorParams<U extends CoreUniverseInstanceNonRecursive> = {
	/**
	 * Universe socket.
	 */
	socket: VSocket<U>;
};

/**
 * Common connection.
 */
export class CoreConnection<U extends CoreUniverseInstanceNonRecursive> {
	/**
	 * Client UUID.
	 */
	public shardUuids: Set<Uuid> = new Set();

	/**
	 * Universe socket.
	 */
	public socket: VSocket<U>;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({ socket }: CoreConnectionConstructorParams<U>) {
		// Set this target
		this.socket = socket;
	}
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
