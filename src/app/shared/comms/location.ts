/**
 * Location.
 */

import { LocationUuid, OccupantUuid, WorldUuid } from "./uuid";
import { CommsMappablePath } from "./map";
import { Occupant } from "./occupant";
import { Vector } from "../../common/vector";

/**
 * A location-like.
 */
export interface Location extends LocationPath, Vector {
	/**
	 * Array of occupants.
	 */
	occupants: Map<OccupantUuid, Occupant>;

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
