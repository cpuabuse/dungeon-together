/*
	File: src/shared/world/occupant.ts
	cpuabuse.com
*/

/**
 * Occupant of cells.
 */

import { Cell } from "./cell";

/**
 * The occupant itself.
 */
export class Occupant {
	/**
	 * Cell occupied by the unit.
	 */
	cell: Cell;

	/**
	 * Constructor for occupant.
	 */
	constructor(cell: Cell) {
		this.cell = cell;
	}
}
