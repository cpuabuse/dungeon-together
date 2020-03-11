/*
	File: src/shared/world/occupant.ts
	cpuabuse.com
*/

/**
 * Occupant of cells.
 */

import { Cell } from "./cell";
import { Occupant } from "../comms/interfaces";
import { Universe } from "./universe";
import { defaultMode } from "../common/defaults";

/**
 * Arguments for constructor of a thing.
 */
export interface ThingArgs {
	/**
	 * Kind of thing in world.
	 */
	kind: string;

	/**
	 * Cell or universe to get information from.
	 */
	parent: Cell | Universe;

	/**
	 * The whole world
	 */
	world: string;
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
	world: string;
}

/**
 * The occupant itself.
 *
 * **About `None`**
 *
 * Special case of a [[Thing]], literally nothing.
 * It is a form of thing and classes that extend it, that was created just to fill the cell with something.
 * The classes create instances which this represents, when they are using reduced number of arguments in constructors, and it chains down to the thing.
 */
export abstract class Thing implements Occupant {
	/**
	 * Kind of this thing in the world.
	 */
	public kind: string;

	/**
	 * Mode of the thing.
	 */
	public mode: string = defaultMode;

	/**
	 * Cell occupied by the thing.
	 */
	public cell: Cell;

	/**
	 * Universe this resides in.
	 */
	public universe: Universe;

	/**
	 * World this is in.
	 */
	public world: string;

	/**
	 * Constructor.
	 */
	public constructor({ kind, parent, world }: ThingArgs) {
		// Cell exists
		let cellIsParent: boolean = parent instanceof Cell;

		// Set universe
		this.universe = cellIsParent ? (parent as Cell).universe : (parent as Universe);

		// Set world
		this.world = world;

		// Set kind
		this.kind = kind;

		// Connect with cell
		if (cellIsParent) {
			// Connect this thing with provided cell
			this.cell = parent as Cell;
			(parent as Cell).occupants.push(this);
		} else {
			// Initialize an empty cell
			this.cell = new Cell({
				things: [this],
				universe: this.universe,
				worlds: new Set(this.world)
			});
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
			// eslint-disable-next-line no-param-reassign
			thing.cell = thisCell;
		}
	}
}
