/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Virtual socket abstraction.
 */

import { MessageTypeWord, vSocketMaxQueue } from "../../common/defaults/connection";
import { CoreLog, LogLevel } from "../error";
import { CoreUniverseInstanceNonRecursive } from "../universe";
import { CoreConnection, CoreMessage } from ".";

/**
 * Envelope, a single transaction.
 */
export class CoreEnvelope<Message extends CoreMessage> {
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

/**
 * Core socket.
 */
export abstract class CoreSocket<ReceiveMessage extends CoreMessage, SendMessage extends CoreMessage> {
	/**
	 * Temporary connection, to be replaced with proper game tick.
	 */
	// TODO: Replace with game tick
	public connection?: CoreConnection<CoreUniverseInstanceNonRecursive, ReceiveMessage, SendMessage>;

	/**
	 * Queue to use for this socket.
	 */
	private queue: Array<ReceiveMessage> = new Array() as Array<ReceiveMessage>;

	/**
	 * Reads from the queue.
	 *
	 * @returns Message
	 */
	// Return type has `extends` to preserve union, and gets rid of keys that are not in `CoreMessage`
	public readQueue(): ReceiveMessage extends CoreMessage ? Pick<ReceiveMessage, keyof CoreMessage> : never {
		// Pop
		let message: ReceiveMessage | undefined = this.queue.shift();

		// Return if array empty
		if (typeof message === "undefined") {
			// Casting as inheriting condition needed
			return new CoreMessage({ body: null, type: MessageTypeWord.Empty }) as ReceiveMessage extends CoreMessage
				? Pick<ReceiveMessage, keyof CoreMessage>
				: never;
		}

		// Return if we could pop
		// Casting as inheriting condition needed
		return message as ReceiveMessage extends CoreMessage ? Pick<ReceiveMessage, keyof CoreMessage> : never;
	}

	/**
	 * Send an envelope.
	 */
	public abstract send({ messages }: CoreEnvelope<SendMessage>): Promise<void>;

	/**
	 * Adds to the queue.
	 *
	 * @param message - Message to add
	 */
	public writeQueue(message: ReceiveMessage): void {
		if (this.queue.length < vSocketMaxQueue) {
			this.queue.push(message);
		} else {
			// Global log, since it is not guaranteed that socket is inside any universe
			CoreLog.global.log({ error: new Error("Queue limit reached"), level: LogLevel.Alert });
		}
	}
}
