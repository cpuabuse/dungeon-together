/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Spike.
 */

import { Trap } from "./trap";

/**
 * Actual spikes coming up from the floor and penetrate the player. the player looses 1/3 HP.
 * Spikes activates, when player walks on the trap. Spikes go back to their original state after the player
 * suffered damage. If player walks again on spikes, then spikes will reactivate.
 */
export class Spike extends Trap {
	public mode: string = "spike";
}
