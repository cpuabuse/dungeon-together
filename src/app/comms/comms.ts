/*
	File: src/shared/comms/comms.ts
	cpuabuse.com
*/

/**
 * Collection of interfaces for communication between client and server.
 */

import { Vector } from "../render/vao";

/**
 * A location-like.
 */
export interface Location {
	occupants: Array<Occupant>;
}

/**
 * An object-like.
 */
export interface Occupant {
	mode: string;
}

/**
 * A map-like.
 */
export interface Map {
	locations: Array<Location>;
}
