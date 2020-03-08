/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { Thing } from "./thing";
import { World } from "./world";

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
	public world: World;

	/**
	 * Cell constructor.
	 */
	public constructor({ things, world }: { things?: Array<Thing>; world: World }) {
		// Set world
		this.world = world;

		// Initialize manifest
		Object.values(this.world.thingKinds).forEach(thingKind => {
			thingKind.kind.initialize(this);
		});

		// Initialize things
		if (things !== undefined) {
			things.forEach(thing => {
				thing.initialize(this);
			});
		}
	}
}

/**
 * Literally nowhere.
 */
export class Nowhere extends Cell {}
