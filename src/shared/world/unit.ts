/*
	File: src/shared/world/unit.ts
	cpuabuse.com
*/

/**
 * Units to be occupying cells within the grid.
 */

import { Cell } from "./grid";

/**
 * Actual unit base class.
 */
export class Unit {
	/**
	 * Cell occupied by the unit.
	 */
	cell: Cell;
}
