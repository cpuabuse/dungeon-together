/**
 * Map.
 */

import { CommsMapUuid, LocationUuid } from "./uuid";
import { InstancePath } from "./instance";

/**
 * A map-like.
 */
export interface CommsMap extends CommsMapPath {
	/**
	 * Locations within the map.
	 */
	locations: Map<LocationUuid, Location>;
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
