/**
 * Location.
 */

import { Occupant, OccupantArgs, OccupantPath } from "./occupant";
import { MappaPath } from "./mappa";
import { Uuid } from "../../common/uuid";
import { Vector } from "../../common/vector";

/**
 * A location-like.
 */
export interface LocusArgs extends LocusPath, Vector {
	/**
	 * Array of occupants.
	 */
	occupants: Map<Uuid, OccupantArgs>;

	/**
	 * Worlds
	 */
	worlds: Set<Uuid>;
}

/**
 * Locus implementable.
 */
export interface Locus extends LocusArgs {
	/**
	 * Default [[Occupant]] UUID.
	 */
	defaultOccupantUuid: Uuid;

	/**
	 * Adds [[Occupant]].
	 */
	addOccupant(occupant: OccupantArgs): void;

	/**
	 * Gets [[Occupant]].
	 */
	getOccupant(path: OccupantPath): Occupant;

	/**
	 * Removes [[Occupant]].
	 */
	removeOccupant(path: OccupantPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Way to get to location.
 */
export interface LocusPath extends MappaPath {
	/**
	 * Location uuid.
	 */
	locusUuid: Uuid;
}
