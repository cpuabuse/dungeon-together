/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vectors
 */

/**
 * Enum for coords.
 */
export enum VectorCoord {
	X = "x",
	Y = "y",
	Z = "z"
}

/**
 * The vector representing a point of display.
 */
export interface Vector {
	/**
	 * X coordinate.
	 */
	[VectorCoord.X]: number;

	/**
	 * Y coordinate.
	 */
	[VectorCoord.Y]: number;

	/**
	 * Z coordinate.
	 */
	[VectorCoord.Z]: number;
}

/**
 * Default vector.
 */
export const defaultVector: Vector = {
	[VectorCoord.X]: 0,
	[VectorCoord.Y]: 0,
	[VectorCoord.Z]: 0
};
