/*
	File: src/shared/comms/comms.ts
	cpuabuse.com
*/

import { Vector } from "../common/vector";

/**
 * Collection of interfaces for communication between client and server.
 */

/**
 * For objects existing as part of instances.
 */
export interface Instanceable {
	/**
	 * Gets the instance.
	 */
	getInstance(uuid: InstanceUuid): Instance | undefined;

	/**
	 * Actual instances.
	 */
	readonly instances: Map<InstanceUuid, Instance>;
}

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

/**
 * Uuid alias for [[CommsMap]].
 */
export type CommsMapUuid = Uuid;

/**
 * Uuid alias for [[Instance]].
 */
export type InstanceUuid = Uuid;

/**
 * Uuid alias for [[Kind]].
 */
export type KindUuid = Uuid;

/**
 * Uuid alias for [[Location]].
 */
export type LocationUuid = Uuid;

/**
 * Uuid alias for [[Mode]].
 */
export type ModeUuid = Uuid;

/**
 * Uuid alias for [[Occupant]].
 */
export type OccupantUuid = Uuid;

/**
 * Uuid alias for [[View]].
 */
export type ViewUuid = Uuid;

/**
 * Uuid alias for [[World]].
 */
export type WorldUuid = Uuid;

/**
 * Alias for uuid.
 */
export type Uuid = string;
