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
import { Vector3D } from "../common/vector";

/**
 * Arguments for the grid.
 * The [[Vector]] is for convinience of generation only.
 */
export interface GridArgs extends CommsMap {
	/**
	 * Overrides the [[CommsMap.locations]].
	 */
	locations: Array<Cell>;
	worlds: Set<string>;
	universe: Universe;
}

/**
 * Indexing for things, index of array of which is the id of the cell.
 */
export interface Index extends Vector3D {
	cell: Cell;
}

/**
 * The grid itself.
 */
export class Grid implements CommsMap {
	/**
	 * Index for cells.
	 */
	public index: Map<string, Index> = new Map();

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
	 * Initializes the grid.
	 * @param worlds The default world will be ignored, as it is already present by default.
	 */
	public constructor({ locations, universe, worlds }: GridArgs) {
		// Set universe
		this.universe = universe;

		// Set worlds
		this.worlds = new Set(worlds);

		// Create cells
		locations.forEach((location, index) => {
			let cell: Cell = new Cell({ occupants: location.occupants, universe: this.universe, worlds: this.worlds });
			this.locations.push(cell);
			this.index.set(cell.uuid, { cell, x: location.x, y: location.y, z: location.z });
		});
	}
}
