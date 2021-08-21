/*
	Copyright 2021 cpuabuse.com
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
export enum MovementWord {
	Up,
	Down,
	Left,
	Right,
	ZUp,
	ZDown
}

/**
 * Enum representing different types of messages.
 */
export enum MessageTypeWord {
	Empty = "empty",
	Sync = "sync",
	Movement = "movement"
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
