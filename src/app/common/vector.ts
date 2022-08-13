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
	 * Public constructor.
	 *
	 * @param vector - Vector
	 */
	public constructor(vector: Vector) {
		super(vector.x);

		// Can not iterate through `this`, as it is an empty array
		for (let i: number = 0; i < this.length; i++) {
			this[i] = Array.from(new Array(vector.y), () => new Array<T | undefined>(vector.z));
		}
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;
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
		for (let vector: Vector = defaultVector; vector.x <= this.x; vector.x++) {
			for (; vector.y <= this.y; vector.y++) {
				for (; vector.z <= this.z; vector.z++) {
					this.setElement({
						element: elements[vector.x * vector.y * vector.z],
						vector
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
	public getElement(vector: Vector): T | undefined {
		// Z check omitted, as overflow produces undefined
		if (vector.x <= this.x && vector.y <= this.y) {
			return this[vector.x][vector.y][vector.z];
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
				this[vector.x][vector.y][vector.z] = element;
			}
		}
	}
}
