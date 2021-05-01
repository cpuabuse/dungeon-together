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
	Empty,
	Sync,
	Movement
}

/**
 * Maximum length of envelope queue.
 */
export const vSocketMaxQueue: number = 100;

/**
 * How many envelopes should be dequeued at a time.
 */
export const vSocketMaxDequeue: number = 2;
