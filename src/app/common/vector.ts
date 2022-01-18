/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vectors
 */

/**
 * The vector representing a point of display.
 */
export interface Vector {
	/**
	 * X coordinate.
	 */
	x: number;

	/**
	 * Y coordinate.
	 */
	y: number;

	/**
	 * Z coordinate.
	 */
	z: number;
}

/**
 * Default vector.
 */
export const defaultVector: Vector = {
	x: 0,
	y: 0,
	z: 0
};
