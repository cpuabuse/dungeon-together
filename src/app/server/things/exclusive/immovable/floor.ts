/*
	File: src/app/world/things/exclusive/immovable/floor.ts
	cpuabuse.com
*/

/**
 * Floor.
 */

import { Immovable } from "../immovable";

/**
 * Actual unit base class.
 */
export class Floor extends Immovable {
	/**
	 * Always wall mode.
	 */
	public mode: string = "floor";
}
