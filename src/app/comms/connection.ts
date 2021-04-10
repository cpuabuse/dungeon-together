/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Connection between server and client.
 */

/**
 * Client-server command interface.
 */
export class Envelope {
	/**
	 * Message data.
	 */
	private message: unknown;

	/**
	 * Type of the message.
	 */
	private type: string;

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
		type: string;
	}) {
		// Initialize private properties
		this.message = message;
		this.type = type;
	}
}
