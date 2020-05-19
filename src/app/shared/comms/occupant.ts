/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Occupant.
 */

import { LocusPath } from "./locus";
import { Uuid } from "../../common/uuid";

/**
 * An object-like.
 */
export interface OccupantArgs extends OccupantPath {
	/**
	 * Kind of occupant.
	 */
	kindUuid: Uuid;

	/**
	 * Mode of the occupant.
	 */
	modeUuid: Uuid;

	/**
	 * World in which occupant resides.
	 */
	worldUuid: Uuid;
}

/**
 * Implementable [[OccupantArgs]].
 */
export interface Occupant extends OccupantArgs {
	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Path to an occupant.
 */
export interface OccupantPath extends LocusPath {
	/**
	 * Location uuid.
	 */
	occupantUuid: Uuid;
}
