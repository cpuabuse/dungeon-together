/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for handling user input.
 */

import { EventEmitter } from "events";

/**
 * Identifier for the up movement input.
 */
export const upSymbol: symbol = Symbol("up");

/**
 * Identifier for the up movement input.
 */
export const downSymbol: symbol = Symbol("down");

/**
 * Identifier for the righ movement input.
 */
export const rightSymbol: symbol = Symbol("right");

/**
 * Identifier for the left movement input.
 */
export const leftSymbol: symbol = Symbol("left");

/**
 * Identifier for the up right-click input.
 */
export const rcSymbol: symbol = Symbol("right-click");

/**
 * Identifier for the up right-click input.
 */
export const lcSymbol: symbol = Symbol("left-click");

/**
 * Identifier for the up scroll input.
 */
export const scrollSymbol: symbol = Symbol("scroll");

/**
 * An interface representing the input event.
 */
export interface InputInterface {
	/**
	 * Relative x position.
	 */
	x: number;

	/**
	 * Relative y position.
	 */
	y: number;
}

/**
 * A class representing a sequence of user input, such as keyboard, mouse, touch.
 */
export class Input extends EventEmitter {}
