/*
File: src/shared/world/nowhere.ts
cpuabuse.com
*/

/**
 * Literally nowhere.
 */

import { Cell } from "./cell";
import { Exclusive } from "./exclusive";
import { Stackable } from "./stackable";

/**
 * Nowhere itself.
 */
export class Nowhere extends Cell {
	constructor(occupant: Exclusive | Stackable) {}
}
