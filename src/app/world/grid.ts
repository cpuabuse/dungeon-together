/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Grid for the dungeons.
 */

import { Cell } from "./cell";

/**
 * The grid itself.
 */
export class Grid {
	/**
	 * Actual cells inside of the grid.
	 */
	cells: Array<Array<Array<Cell>>> = new Array();
}
