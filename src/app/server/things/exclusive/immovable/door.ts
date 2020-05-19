/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
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
