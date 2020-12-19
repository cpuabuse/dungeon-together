/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Trap.
 */

import { Trap } from "./trap";

/**
 * Actual hole in the floor activates when the player walks on the hole. the player falls through the floor back 
to the floor z-1. Hole can be activated every time player walks on it. 
 */
export class Hole extends Trap {
	public mode: string = "hole";
}
