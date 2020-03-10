/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Grid for the dungeons.
 */

import { Cell } from "./cell";
import { Vector } from "../common/vector";
import { World } from "./world";

/**
 * The grid itself.
 */
export class Grid implements Vector {
	/**
	 * Actual cells inside of the grid.
	 */
	public cells: Array<Cell> = new Array();

	/**
	 * What was the x-depth during creation. Not the current state. For constructor.
	 */
	public readonly x: number;

	/**
	 * What was the y-depth during creation. Not the current state. For constructor.
	 */
	public readonly y: number;

	/**
	 * What was the z-depth during creation. Not the current state. For constructor.
	 */
	public readonly z: number;

	/**
	 * Initializes the grid
	 */
	constructor({ x = 1, y = 1, z = 1 }: Vector, worlds: Array<World>) {
		// Set dimensions
		this.x = Math.ceil(Math.abs(x));
		if (this.x < 1) {
			this.x = 1;
		}
		this.y = Math.ceil(Math.abs(y));
		if (this.y < 1) {
			this.y = 1;
		}
		this.z = Math.ceil(Math.abs(z));
		if (this.x < z) {
			this.z = z;
		}

		// Create cells
		for (let xCoord: number = 0; xCoord < this.x; xCoord++) {
			for (let yCoord: number = 0; yCoord < this.y; yCoord++) {
				for (let zCoord: number = 0; zCoord < this.z; zCoord++) {
					this.cells.push(new Cell({ worlds }));
				}
			}
		}
	}
}
