/*
File: src/app/units/none.ts
cpuabuse.com
*/

/**
 * Nothing.
 */

import { Cell } from "../../../../build/release/server/world/cell";
import { Nowhere } from "../grid/nowhere";
import { Thing } from "../thing";

/**
 * Literally nothing.
 */
export class None implements Thing {
	cell: Cell = new Nowhere(this);
}
