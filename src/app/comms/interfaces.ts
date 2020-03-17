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
export interface Identifiable {
	uuid: Uuid;
}

/**
 * Everything-like.
 */
export interface Instance {
	/**
	 * Locations.
	 */
	maps: Map<Uuid, Location>;
}

/**
 * A location-like.
 */
export interface Location extends Identifiable, Vector {
	/**
	 * Array of occupants.
	 */
	occupants: Array<Occupant>;

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
export interface Occupant extends Identifiable {
	/**
	 * Instance occupant is is part of.
	 */
	instance: Uuid;

	/**
	 * Kind of occupant.
	 */
	kind: Uuid;

	/**
	 * Mode of the occupant.
	 */
	mode: Uuid;

	/**
	 * UUID.
	 */
	uuid: OccupantUuid;

	/**
	 * World in which occupant resides.
	 */
	world: Uuid;
}

export type InstaceUuid = Uuid;
export type KindUuid = Uuid;
export type LocationUuid = Uuid;
export type ModeUuid = Uuid;
export type OccupantUuid = Uuid;
export type ViewUuid = Uuid;
export type WorldUuid = Uuid;

/**
 * Alias for uuid.
 */
export type Uuid = string;
