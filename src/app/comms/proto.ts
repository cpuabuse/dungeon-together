/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Comms-proto, part of universe.
 */

import { CommsUniverse } from "./universe";

/**
 * For objects existing as part of [[CommsUniverse]].
 */
export interface CommsProto {
	/**
	 * Events.
	 */
	events: Array<Event>;

	/**
	 * Actual universe.
	 */
	universe: CommsUniverse;
}
