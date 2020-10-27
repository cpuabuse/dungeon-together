/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Poolable, part of universe.
 */

import { CommsUniverse } from "./comms-universe";

/**
 * For objects existing as part of [[CommsUniverse]].
 */
export interface Poolable {
	/**
	 * Actual universe.
	 */
	universe: CommsUniverse;
}
