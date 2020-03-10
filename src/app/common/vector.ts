/*
	File: src/app/common/vector.ts
	cpuabuse.com
*/

/**
 * Vectors.
 */

/**
 * The vector representing a point of display.
 */
export interface Vector {
	/**
	 * X coordinate.
	 */
	x?: number;

	/**
	 * Y coordinate.
	 */
	y?: number;

	/**
	 * Z coordinate.
	 */
	z?: number;
}

/**
 * The vector representing a point of display.
 * Definitely 3D.
 */
export interface Vector3D extends Vector {
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
