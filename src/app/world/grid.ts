/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Grid for the dungeons.
 */

import { Cell } from "./cell";
import { Vector } from "../render/vao";
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
	 * X coordinate.
	 */
	public readonly x: number;

	/**
	 * Y coordinate.
	 */
	public readonly y: number;

	/**
	 * Z coordinate.
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

/**
 * Collection of VAOs.
 * Corresponds to grid.
 */
export class VaoCollection {}
