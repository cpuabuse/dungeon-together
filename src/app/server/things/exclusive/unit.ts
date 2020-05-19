/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Units to be occupying cells within the grid.
 */

import { Exclusive } from "../exclusive";

/**
 * Actual unit base class.
 */
export class Unit extends Exclusive {
	/**
	 * CP.
	 */
	public combatPoints: number = 0;

	/**
	 * HP.
	 */
	public healthPoints: number = 1;

	/**
	 * MP.
	 */
	public manaPoints: number = 0;
}
