/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { Kind, Thing } from "./thing";
import { None } from "./things/none";
import { World } from "./world";

/**
 * Arguments of a cell.
 */
export interface CellArgs {
	things?: Array<Thing>;
	world: World;
}

/**
 * Manifest defining occupnats kinds in the cell.
 */
export interface Manifest {
	/**
	 * Kinds, an array.
	 */
	manifestKinds: Array<ManifestKind>;
}

/**
 * Information about a kind in manifest.
 */
export interface ManifestKind {
	/**
	 *  Should refer to classes implementing kinds, for static methods.
	 */
	kind: Kind;
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
export class Cell implements Nav {
	/**
	 * Cell occupants
	 */
	public things: Array<Thing> = new Array();

	/**
	 * Down movement.
	 */
	private down: Cell = this;

	/**
	 * Left movement.
	 */
	private left: Cell = this;

	/**
	 * Right movement.
	 */
	private right: Cell = this;

	/**
	 * Up movement.
	 */
	private up: Cell = this;

	/**
	 * Vertical down movement.
	 */
	private zDown: Cell = this;

	/**
	 * Vertical up movement.
	 */
	private zUp: Cell = this;

	/**
	 * Indicates which world this cell is part of.
	 */
	private world: World;

	/**
	 * Cell constructor.
	 */
	public constructor({ things, world }: CellArgs) {
		// Set world
		this.world = world;

		// Initialize manifest
		this.world.manifest.manifestKinds.forEach(manifestKind => {
			manifestKind.kind.initializeKind(this);
		});

		// Initialize things
		things.forEach(thing => {
			thing.initialize(this);
		});
	}
}
