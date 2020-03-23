/**
 * Instance.
 */

import { CommsMapUuid, InstanceUuid } from "./uuid";
import { CommsMap } from "./map";

/**
 * Everything-like.
 */
export interface Instance extends InstancePath {
	/**
	 * Locations.
	 */
	maps: Map<CommsMapUuid, CommsMap>;
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
