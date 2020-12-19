/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
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
