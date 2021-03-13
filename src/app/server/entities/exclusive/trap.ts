/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Trap.
 */

import { Exclusive } from "../exclusive";

/**
 * Actual trap. The player can fall or loose HP depending on the trap class (spike/hole)
 */
export abstract class Trap extends Exclusive {
	/**
	 * The visibility of trap, wether its visible or not.
	 */
	public visible: boolean;

	/**
	 * The damage the trap can cause to the player.
	 */
	public damage: number;
}
