/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { None } from "../units/none";
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
 * The cell within the grid.
 */
export class Cell implements Nav {
	down: Cell = this;

	left: Cell = this;

	right: Cell = this;

	/**
	 * Unit occupying a cell.
	 */
	unit: Unit = new None(this);

	up: Cell = this;

	zDown: Cell = this;

	zUp: Cell = this;
}
