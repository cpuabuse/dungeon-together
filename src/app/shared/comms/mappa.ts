/**
 * Map.
 */

import { Locus, LocusArgs, LocusPath } from "./locus";
import { InstancePath } from "./instance";
import { Uuid } from "../../common/uuid";

/**
 * A map-like.
 */
export interface MappaArgs extends MappaPath {
	/**
	 * Locations within the map.
	 */
	locis: Map<Uuid, LocusArgs>;
}

/**
 * Implementable [[MappaArgs]].
 */
export interface Mappa extends MappaArgs {
	/**
	 * Default [[Locus]] UUID.
	 */
	defaultLocusUuid: Uuid;

	/**
	 * Adds [[Locus]].
	 */
	addLocus(mappa: LocusArgs): void;

	/**
	 * Gets [[Locus]].
	 */
	getLocus(path: LocusPath): Locus;

	/**
	 * Removes [[Locus]].
	 */
	removeLocus(path: LocusPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Way to get to map.
 */
export interface MappaPath extends InstancePath {
	/**
	 * Map uuid.
	 */
	mappaUuid: Uuid;
}
