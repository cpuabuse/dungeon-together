/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { Location } from "../shared/interfaces";
import { Thing } from "./thing";
import { ThingKinds } from "./world";
import { Universe } from "./universe";
import { v4 as uuid } from "uuid";

/**
 * Arguments for cell constructor.
 */
export interface CellArgs extends Location {
	/**
	 * Parent universe. Overrides [[Location.instance]].
	 */
	instance: Universe;

	/**
	 * Things inside. Overrides [[Location.occupants]].
	 */
	occupants: Array<Thing>;
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
	 * Coordinates in map. An id given during creation. Does not represent anything visually or logically.
	 */
	public uuid: string = uuid();

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
	public constructor({ occupants, universe, worlds }: CellArgs) {
		// Set universe
		this.universe = universe;

		// Set world
		this.worlds = new Set(worlds);

		// Initialize manifests
		this.worlds.forEach(world => {
			let kinds: ThingKinds = this.universe.worlds[world].thingKinds;
			Object.keys(kinds).forEach(thingKind => {
				kinds[thingKind].kind.initialize({ cell: this, kind: thingKind, world });
			});
		});

		// Initialize things
		occupants.forEach(thing => {
			this.occupants.push(new this.universe.worlds[thing.world].thingKinds[thing.kind].kind(this));
		});
	}
}
