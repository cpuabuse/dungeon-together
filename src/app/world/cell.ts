/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { Square } from "../render/vao";
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
export class Cell implements Nav, Square {
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
	public worlds: Array<World>;

	/**
	 * Cell constructor.
	 * Creates nowhere by default.
	 */
	public constructor({ things, worlds }: { things?: Array<Thing>; worlds: Array<World> }) {
		// Set world
		this.worlds = worlds;

		// Initialize manifests
		this.worlds.forEach(world => {
			Object.keys(world.thingKinds).forEach(thingKind => {
				world.thingKinds[thingKind].kind.initialize({ cell: this, kind: thingKind, world });
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
