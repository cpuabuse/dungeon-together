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
export interface Message {
	/**
	 * Type of the message.
	 */
	type: string;

	/**
	 * Message data.
	 */
	data: unknown;
}
