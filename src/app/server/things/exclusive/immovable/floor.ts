/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
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
