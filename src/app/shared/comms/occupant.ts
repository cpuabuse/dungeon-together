/**
 * Occupant.
 */

import { KindUuid, ModeUuid, OccupantUuid, WorldUuid } from "./uuid";
import { LocationPath } from "./location";

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
