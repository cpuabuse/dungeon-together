/*
	File: src/shared/world/occupant.ts
	cpuabuse.com
*/

/**
 * Occupant of cells.
 */

import { Cell } from "./cell";
import { Renderable } from "../render/renderable";
import { World } from "./world";

/**
 * Arguments for constructor of a thing.
 */
export interface ThingArgs {
	cell?: Cell;
	world: World;
}

/**
 * The occupant itself.
 */
export abstract class Thing extends Renderable {
	/**
	 * Cell occupied by the thing.
	 */
	private cell: Cell;

	/**
	 * Exclusive constructor;
	 */
	public constructor({ cell, world }: ThingArgs) {
		// Call superclass
		super();

		// Connect with cell
		if (cell === undefined) {
			// Initialize an empty cell
			this.cell = new Cell({
				things: [this],
				world
			});
		} else {
			// Connect this cell with provided cell
			this.cell = cell;
			cell.things.push(this);
		}
	}

	/**
	 * Initializes the cell's things.
	 */
	public static initialize(
		// Fix the linting errors; This method is defined to provide type
		// eslint-disable-next-line
		cell: Cell
	): void {
		// Do nothing
	}

	/**
	 * Initializes the cell. To be overriden by extending the class.
	 */
	public initialize(cell: Cell): void {
		// @ts-ignore:2511 This is only an example
		let thing: Thing = new Thing({ cell, world: this.world });
		this.swap(thing);
	}

	/**
	 * Swaps cells with a target thing. To be overriden by extending class.
	 */
	public swap(thing: Thing): void {
		let thisCell: Cell = this.cell;
		this.cell = thing.cell;

		// Parameter is a class instance to be referenced.
		thing.cell = thisCell;
	}
}
