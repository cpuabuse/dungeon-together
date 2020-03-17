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
	maps: Array<CommsMap>;
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
	 * UUID. Overrides [[Identifiable.uuid]].
	 */
	uuid: LocationUuid;

	/**
	 * Worlds
	 */
	worlds: Set<WorldUuid>;
}

/**
 * A map-like.
 */
export interface CommsMap extends Identifiable {
	/**
	 * Locations within the map.
	 */
	locations: Array<Location>;

	/**
	 * UUID. Overrides [[Identifiable.uuid]].
	 */
	uuid: CommsMapUuid;
}

/**
 * An object-like.
 */
export interface Occupant extends Identifiable {
	/**
	 * Instance occupant is is part of.
	 */
	instance: InstanceUuid;

	/**
	 * Kind of occupant.
	 */
	kind: KindUuid;

	/**
	 * Mode of the occupant.
	 */
	mode: ModeUuid;

	/**
	 * UUID. Overrides [[Identifiable.uuid]].
	 */
	uuid: OccupantUuid;

	/**
	 * World in which occupant resides.
	 */
	world: WorldUuid;
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
