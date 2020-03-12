/*
	File: src/app/world/things/exclusive/immovable/wall.ts
	cpuabuse.com
*/

/**
 * Walls etc.
 */

import { Immovable } from "../immovable";

/**
 * Actual unit base class.
 */
export class Wall extends Immovable {
	/**
	 * Always wall mode.
	 */
	public mode: string = "wall";
}
