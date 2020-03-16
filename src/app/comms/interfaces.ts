/*
	File: src/shared/comms/comms.ts
	cpuabuse.com
*/

import { Vector } from "../common/vector";

/**
 * Collection of interfaces for communication between client and server.
 */

/**
 * Base type for a managed object.
 */
export interface Base {
	uuid: Uuid;
}

/**
 * Everything-like.
 */
export interface Instance {
	maps: Array<CommsMap>;
}

/**
 * A location-like.
 */
export interface Location extends Base, Vector {
	/**
	 * Array of occupants.
	 */
	occupants: Array<Occupant>;

	/**
	 * Instance this belongs to.
	 */
	instance: Uuid;

	/**
	 * Worlds
	 */
	worlds: Set<string>;
}

/**
 * A map-like.
 */
export interface CommsMap extends Base {
	locations: Array<Location>;
}

/**
 * An object-like.
 */
export interface Occupant extends Base {
	/**
	 * Kind of occupant.
	 */
	kind: string;

	/**
	 * Location occupant occupies.
	 */
	location: Uuid;

	/**
	 * Mode of the occupant.
	 */
	mode: string;

	/**
	 * Instance occupant is is part of.
	 */
	instance: Instance;

	/**
	 * World in which occupant resides.
	 */
	world: string;
}

/**
 * Alias for uuid.
 */
export type Uuid = string;
