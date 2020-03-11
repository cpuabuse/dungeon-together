/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Grid for the dungeons.
 */

import { Cell } from "./cell";
import { CommsMap } from "../comms/interfaces";
import { Universe } from "./universe";
import { Vector } from "../common/vector";

/**
 * Arguments for the grid.
 * Parent universe is defined, but the worlds are not, as it is not grid-related.
 */
export interface GridArgs extends CommsMap, Vector {
	worlds: Set<string>;
	universe: Universe;
}

/**
 * The grid itself.
 */
export class Grid implements CommsMap, Vector {
	/**
	 * Actual cells inside of the grid.
	 */
	public locations: Array<Cell> = new Array();

	/**
	 * Universe this grid belongs to.
	 */
	public readonly universe: Universe;

	/**
	 * Worlds cells of this grid took during creation.
	 * Not the current state. For cell constructor. Hence readonly.
	 */
	public readonly worlds: Set<string>;

	/**
	 * What was the x-depth during creation.
	 * Not the current state. For cell constructor. Hence readonly.
	 */
	public readonly x: number;

	/**
	 * What was the y-depth during creation.
	 * Not the current state. For cell constructor. Hence readonly.
	 */
	public readonly y: number;

	/**
	 * What was the z-depth during creation.
	 * Not the current state. For cell constructor. Hence readonly.
	 */
	public readonly z: number;

	/**
	 * Initializes the grid.
	 * @param worlds The default world will be ignored, as it is already present by default.
	 */
	constructor({ universe, worlds, x = 1, y = 1, z = 1 }: GridArgs) {
		// Set universe
		this.universe = universe;

		// Set worlds
		this.worlds = new Set(worlds);

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
					this.locations.push(new Cell({ universe: this.universe, worlds: this.worlds }));
				}
			}
		}
	}
}
