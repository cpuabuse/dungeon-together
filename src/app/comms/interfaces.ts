/*
	File: src/shared/comms/comms.ts
	cpuabuse.com
*/

import { Vector } from "../common/vector";

/**
 * Collection of interfaces for communication between client and server.
 */

/**
 * Everything-like.
 */
export interface Instance {
	maps: Array<CommsMap>;
}

/**
 * A location-like.
 */
export interface Location extends Vector {
	occupants: Array<Occupant>;
}

/**
 * A map-like.
 */
export interface CommsMap {
	locations: Array<Location>;
}

/**
 * An object-like.
 */
export interface Occupant {
	/**
	 * Kind of occupant.
	 */
	kind: string;

	/**
	 * Mode of the occupant.
	 */
	mode: string;

	/**
	 * World in which occupant resides.
	 */
	world: string;
}
