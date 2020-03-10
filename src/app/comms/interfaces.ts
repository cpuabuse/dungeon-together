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
	maps: Array<Map>;
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
export interface Map {
	locations: Array<Location>;
}

/**
 * An object-like.
 */
export interface Occupant {
	mode: string;
}
