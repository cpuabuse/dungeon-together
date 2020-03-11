/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { Location } from "../comms/interfaces";
import { Thing } from "./thing";
import { ThingKinds } from "./world";
import { Universe } from "./universe";

/**
 * Arguments for cell constructor.
 */
export interface CellArgs {
	/**
	 * Possible things to add.
	 */
	things?: Array<Thing>;

	/**
	 * Worlds
	 */
	worlds: Set<string>;

	/**
	 * Parent universe.
	 */
	universe: Universe;
}

/**
 * Freedom of movement for cell.
 */
export interface Nav {
	/**
	 * Down movement.
	 */
	down: Cell;

	/**
	 * Left movement.
	 */
	left: Cell;

	/**
	 * Right movement.
	 */
	right: Cell;

	/**
	 * Up movement.
	 */
	up: Cell;

	/**
	 * Vertical down movement.
	 */
	zDown: Cell;

	/**
	 * Vertical down movement.
	 */
	zUp: Cell;
}

/**
 * The cell within the grid.
 */
export class Cell implements Nav, Location {
	/**
	 * Cell occupants
	 */
	public occupants: Array<Thing> = new Array();

	/**
	 * Down movement.
	 */
	public down: Cell = this;

	/**
	 * Left movement.
	 */
	public left: Cell = this;

	/**
	 * Right movement.
	 */
	public right: Cell = this;

	/**
	 * Up movement.
	 */
	public up: Cell = this;

	/**
	 * Vertical down movement.
	 */
	public zDown: Cell = this;

	/**
	 * Vertical up movement.
	 */
	public zUp: Cell = this;

	/**
	 * Indicates which world this cell is part of.
	 */
	public worlds: Set<string>;

	/**
	 * Parent universe.
	 */
	public readonly universe: Universe;

	/**
	 * Cell constructor.
	 * Creates nowhere by default.
	 */
	public constructor({ things, universe, worlds }: CellArgs) {
		// Set universe
		this.universe = universe;

		// Set world
		this.worlds = new Set(worlds);

		// Initialize manifests
		this.worlds.forEach(world => {
			let kinds: ThingKinds = universe.worlds[world].thingKinds;
			Object.keys(kinds).forEach(thingKind => {
				kinds[thingKind].kind.initialize({ cell: this, kind: thingKind, world });
			});
		});

		// Initialize things
		if (things !== undefined) {
			things.forEach(thing => {
				thing.initialize(this);
			});
		}
	}
}
