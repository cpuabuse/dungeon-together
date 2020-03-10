/*
	File: src/shared/world/occupant.ts
	cpuabuse.com
*/

/**
 * Occupant of cells.
 */

import { Cell } from "./cell";
import { Occupant } from "../comms/interfaces";
import { World } from "./world";

/**
 * Arguments for constructor of a thing.
 */
export interface ThingArgs {
	/**
	 * Cell to occupy.
	 */
	cell?: Cell;

	/**
	 * Kind of thing in world.
	 */
	kind: string;

	/**
	 * The whole world
	 */
	world: World;
}

/**
 * Arguments for constructor of a thing.
 */
export interface InitializeArgs {
	/**
	 * Cell to occupy.
	 */
	cell: Cell;

	/**
	 * Kind of thing in world.
	 */
	kind: string;

	/**
	 * The whole world
	 */
	world: World;
}

/**
 * An abstract entry not representing a class.
 * It is a form of thing and classes that extend it, that was created just to fill the cell with something.
 * The classes create instances which this represents, when they are using reduced number of arguments in constructors, and it chains down to the thing.
 * Literally nothing.
 */
abstract class None extends Thing {} // eslint-disable-line no-unused-vars

/**
 * The occupant itself.
 */
export abstract class Thing implements Occupant {
	/**
	 * Kind of this thing in the world.
	 */
	public kind: string;

	/**
	 * Cell occupied by the thing.
	 */
	private cell: Cell;

	/**
	 * World this is in.
	 */
	private world: World;

	/**
	 * Constructor.
	 */
	public constructor({ cell, kind, world }: ThingArgs) {
		// Set kind
		this.kind = kind;

		// Set world
		this.world = world;

		// Connect with cell
		if (cell === undefined) {
			// Initialize an empty cell
			this.cell = new Cell({
				things: [this],
				worlds: [world]
			});
		} else {
			// Connect this cell with provided cell
			this.cell = cell;
			cell.locations.push(this);
		}
	}

	/**
	 * Initializes the cell's things.
	 */
	public static initialize(
		// Fix the linting errors; This method is defined to provide type
		{
			cell, // eslint-disable-line no-unused-vars
			kind, // eslint-disable-line no-unused-vars
			world // eslint-disable-line no-unused-vars
		}: InitializeArgs
	): void {
		// Do nothing
	}

	/**
	 * Initializes the cell. To be overriden by extending the class.
	 * Creates none if cell not provided, so should classes extending this class.
	 */
	public initialize(cell: Cell): void {
		let thing: Thing = this.constructor({ cell, kind: this.kind, world: this.world });
		this.swap(thing);
	}

	/**
	 * Swaps cells with a target thing. To be overriden by extending class.
	 */
	public swap(thing: Thing): void {
		if (this.kind === thing.kind) {
			let thisCell: Cell = this.cell;
			this.cell = thing.cell;

			// Parameter is a class instance to be referenced.
			thing.cell = thisCell;
		}
	}
}
