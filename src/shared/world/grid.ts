/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Grid for the dungeons.
 */

import { Unit } from "./unit";

/**
 * Freedom of movement for cell.
 */
interface Nav {
	down: Cell;
	left: Cell;
	right: Cell;
	up: Cell;
	zDown: Cell;
	zUp: Cell;
}

/**
 * The grid itself.
 */
export class Grid {
	/**
	 * Actual cells inside of the grid.
	 */
	cells: Array<Cell>;
}

/**
 * The cell within the grid.
 */
export class Cell implements Nav {
	/**
	 * Unit occupying a cell.
	 */
	unit: Unit;
}
