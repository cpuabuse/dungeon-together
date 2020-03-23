/*
	File: src/shared/world/occupant.ts
	cpuabuse.com
*/

/**
 * Occupant of cells.
 */

import { Cell } from "./cell";
import { Occupant } from "../shared/interfaces";
import { Universe } from "./universe";
import { defaultMode } from "../common/defaults";

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

// TODO: Check that "Thing.new" generates documentation correctly
/**
 * Arguments for [[Thing.new]].
 */
export interface ThingArgs extends Occupant {
	/**
	 * Universe this is part of. Overrides [[Occupant.instance]].
	 */
	instace: Universe;
}

/**
 * The thing itself. Can be anything that resides within the [[Cell]].
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
	public location: Cell;

	/**
	 * Universe this resides in.
	 */
	public instance: Universe;

	/**
	 * World this is in.
	 */
	public world: string;

	/**
	 * Constructor.
	 */
	public constructor({ instance, kind, location, world }: ThingArgs) {
		// Set universe
		this.instance = instance;

		// Set kind
		this.kind = kind;

		// Set location
		this.location = location;

		// Set world
		this.world = world;

		// Connect with cell
		if (cellIsParent) {
			// Connect this thing with provided cell
			this.cell = parent as Cell;
			(parent as Cell).occupants.push(this);
		} else {
			// Initialize an empty cell
			this.cell = new Cell({
				occupants: [this],
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
			cell, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
			kind, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
			world // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
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
