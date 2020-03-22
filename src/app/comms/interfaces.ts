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
export interface Instance extends InstancePath {
	/**
	 * Locations.
	 */
	maps: Array<CommsMap>;
}

/**
 * Way to get to instance.
 */
export interface InstancePath {
	/**
	 * Instance uuid.
	 */
	instance: InstanceUuid;
}

/**
 * A location-like.
 */
export interface Location extends LocationPath, Vector {
	/**
	 * Array of occupants.
	 */
	occupants: Array<Occupant>;

	/**
	 * Worlds
	 */
	worlds: Set<WorldUuid>;
}

/**
 * Way to get to location.
 */
export interface LocationPath extends CommsMappablePath {
	/**
	 * Location uuid.
	 */
	location: LocationUuid;
}

/**
 * A map-like.
 */
export interface CommsMap extends CommsMapPath {
	/**
	 * Locations within the map.
	 */
	locations: Array<Location>;
}

/**
 * A path that might point to a map.
 */
export interface CommsMappablePath extends InstancePath {
	/**
	 * Map uuid.
	 */
	map: CommsMapUuid | null;
}

/**
 * Way to get to map.
 */
export interface CommsMapPath extends CommsMappablePath {
	/**
	 * Map uuid.
	 */
	map: CommsMapUuid;
}

/**
 * An object-like.
 */
export interface Occupant extends OccupantPath {
	/**
	 * Kind of occupant.
	 */
	kind: KindUuid;

	/**
	 * Mode of the occupant.
	 */
	mode: ModeUuid;

	/**
	 * World in which occupant resides.
	 */
	world: WorldUuid;
}

/**
 * Path to an occupant.
 */
export interface OccupantPath extends LocationPath {
	/**
	 * Location uuid.
	 */
	occupant: OccupantUuid;
}

export type InstanceUuid = Uuid;
export type CommsMapUuid = Uuid;
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
