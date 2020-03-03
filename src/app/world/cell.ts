/*
	File: src/shared/world/grid.ts
	cpuabuse.com
*/

/**
 * Cells making up the grid.
 */

import { None } from "../units/none";
import { Occupant } from "./occupant";
import { Stackable } from "./stackable";
import { Unit } from "./unit";
import { Exclusive } from "./exclusive";

/**
 * An occupant that has identified type.
 */
interface IdentifiedOccupant {
	name: string;
	occupant: Occupant;
}

/**
 * Freedom of movement for cell.
 */
interface Nav {
	down: Cell;
	left: Cell;
	right: Cell;
	up: Cell;
	zDown: Cell;
	zUp: Cell;
}

/**
 * The cell within the grid.
 */
export class Cell implements Nav {
	down: Cell = this;

	exclusive: Array<IdentifiedOccupant>;

	left: Cell = this;

	right: Cell = this;

	stackable: Array<Stackable>;

	/**
	 * Unit occupying a cell.
	 */
	unit: Unit = new None(this);

	up: Cell = this;

	zDown: Cell = this;

	zUp: Cell = this;

	constructor(exclusive: Exclusive | undefined, stackable: Stackable | undefined) {}
}
