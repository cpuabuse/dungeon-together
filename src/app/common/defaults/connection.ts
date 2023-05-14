/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Defaults for connection/network.
 *
 * Most words used in communication will be represented as numeric enums, to minimize size.
 */

/**
 * Enum representing words used to depict directions.
 */
export enum DirectionWord {
	Up,
	Down,
	Left,
	Right,
	ZUp,
	ZDown,

	/**
	 * Should not be used for actual movement but should be used to represent relative position.
	 */
	Here
}

/**
 * Enum representing different types of messages.
 */
export enum MessageTypeWord {
	Empty = "empty",
	Sync = "sync",
	/**
	 * Client sends information about the movement of a character.
	 */
	Movement = "movement",

	/**
	 * Update shard in the client, sent from server.
	 */
	Update = "update",

	EntityAction = "action",

	LocalAction = "local-action"
}

/**
 * Maximum length of envelope queue.
 */
export const vSocketMaxQueue: number = 100;

/**
 * How many recursive calls permitted within socket's tick-tock cycle.
 *
 * Represents how many times the process can be executed within stack.
 * For `tock()` to work, needs to be not less than 2.
 */
export const vSocketProcessStackLimit: number = 100;

/**
 * How many envelopes should be dequeued at a time.
 */
export const vSocketMaxDequeue: number = 2;
