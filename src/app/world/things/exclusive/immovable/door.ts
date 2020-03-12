/*
	File: src/app/world/things/exclusive/immovable/door.ts
	cpuabuse.com
*/

/**
 * Door.
 */

import { Immovable } from "../immovable";

/**
 * Actual unit base class.
 */
export class Door extends Immovable {
	/**
	 * Always wall mode.
	 */
	public mode: string = "door";
}
