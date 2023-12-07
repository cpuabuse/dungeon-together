/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vectors
 */

import { CoreLog, LogLevel } from "../core/error";

/**
 * Vector coords.
 */
// Infer from array
// eslint-disable-next-line @typescript-eslint/typedef
export const vectorCoords = ["x", "y", "z"] as const;

/**
 * Vector coords.
 */
export type VectorCoords = (typeof vectorCoords)[number];

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

/**
 * Checks if point is within rectangle.
 *
 * @param param - Destructured params
 * @returns `true` if within
 */
export function isWithinRect({
	point,
	rect
}: {
	/**
	 * Point.
	 */
	point: Vector;

	/**
	 * Rectangle.
	 */
	rect: Vector;
}): boolean {
	return point.x <= rect.x && point.y <= rect.y && point.z <= rect.z;
}

/**
 * Creates an array of vectors.
 */
export class VectorArray<T> extends Array<(T | undefined)[][]> implements Vector {
	public x: number;

	public y: number;

	public z: number;

	/**
	 * Y-length.
	 *
	 * @returns Y-length
	 */
	public get yLength(): number {
		return this.y + 1;
	}

	/**
	 * Z-length.
	 *
	 * @returns Z-length
	 */
	public get zLength(): number {
		return this.z + 1;
	}

	/**
	 * Public constructor.
	 *
	 * @param vector - Vector
	 */
	public constructor(vector: Vector) {
		super(vector.x + 1);

		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;

		// Can not iterate through `this`, as it is an empty array
		for (let i: number = 0; i < this.length; i++) {
			this[i] = Array.from(new Array(this.yLength), () => new Array<T | undefined>(this.zLength));
		}
	}

	/**
	 * Fills the array with elements, by taking an array of elements.
	 *
	 * @param param - Destructured params
	 */
	public fillWithElements({
		elements
	}: {
		/**
		 * Elements array.
		 */
		elements: Array<T>;
	}): void {
		for (let { x, y, z }: Vector = defaultVector; x <= this.x; x++) {
			for (; y <= this.y; y++) {
				for (; z <= this.z; z++) {
					this.setElement({
						element: elements[x * this.yLength * this.zLength + y * this.zLength + z],
						vector: { x, y, z }
					});
				}
			}
		}
	}

	/**
	 * Gets element by vector.
	 *
	 * @param vector - Vector to retrieve
	 * @returns Element
	 */
	public getElement({ x, y, z }: Vector): T | undefined {
		try {
			// Z check omitted, as overflow produces undefined
			if (x >= 0 && y >= 0 && x <= this.x && y <= this.y) {
				// Statement is within "try-catch" block
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return this[x]![y]![z];
			}
		} catch (error) {
			CoreLog.global.log({
				error: new Error(`Vector(x=${x}, y=${y}, z=${z}) out of bounds.`, {
					cause: error instanceof Error ? error : undefined
				}),
				level: LogLevel.Error
			});
		}

		return undefined;
	}

	/**
	 * Sets element by vector.
	 *
	 * @param param - Destructured params
	 */
	public setElement({
		vector,
		element
	}: {
		/**
		 * Vector.
		 */
		vector: Vector;

		/**
		 * Element.
		 */
		element: T | undefined;
	}): void {
		if (element !== undefined) {
			if (vector.x <= this.x && vector.y <= this.y && vector.z <= this.z) {
				try {
					// Statement is within "try-catch" block
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this[vector.x]![vector.y]![vector.z] = element;
				} catch (error) {
					CoreLog.global.log({
						error: new Error(`Vector(x=${vector.x}, y=${vector.y}, z=${vector.z}) out of bounds.`, {
							cause: error
						}),
						level: LogLevel.Error
					});
				}
			}
		}
	}
}
