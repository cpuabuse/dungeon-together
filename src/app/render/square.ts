/*
	File: src/app/render/square.ts
	cpuabuse.com
*/

/**
 * Squares on screen.
 */

import { Location } from "../comms/interfaces";
import { Ru } from "./ru";
import { Screen } from "./screen";
import { Vector3D } from "../common/vector";

/**
 * Arguments of square.
 */
export interface SquareArgs extends Location {
	screen: Screen;
}

/**
 * Square(Vector).
 */
export class Square implements Location, Vector3D {
	/**
	 * X coordinate.
	 */
	public x: number;

	/**
	 * Y coordinate.
	 */
	public y: number;

	/**
	 * Z coordinate.
	 */
	public z: number;

	/**
	 * Contents of square.
	 */
	public occupants: Array<Ru> = new Array();

	/**
	 * Constructs square.
	 */
	public constructor({ occupants, screen, x = 0, y = 0, z = 0 }: SquareArgs) {
		// Initialize coordinates
		this.x = x;
		this.y = y;
		this.z = z;

		// Fill occupants
		if (occupants !== undefined) {
			occupants.forEach(occupant => {
				this.occupants.push(new Ru({ mode: occupant.mode, screen, square: this }));
			});
		}
	}
}
