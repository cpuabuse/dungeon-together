/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vectors
 */

/**
 * Vector coords.
 */
// Infer from array
// eslint-disable-next-line @typescript-eslint/typedef
export const vectorCoords = ["x", "y", "z"] as const;

/**
 * Vector coords.
 */
export type VectorCoords = typeof vectorCoords[number];

/**
 * The vector representing a point of display.
 */
export type Vector = {
	[K in VectorCoords]: number;
};

/**
 * Default vector.
 */
export const defaultVector: Vector = {
	x: 0,
	y: 0,
	z: 0
};
