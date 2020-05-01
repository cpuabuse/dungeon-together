/*
	File: src/shared/comms/reality.ts
	cpuabuse.com
*/

/**
 * Shared pool.
 */

import { Instance, InstanceArgs, InstancePath } from "./comms/instance";
import { Locus, LocusPath } from "./comms/locus";
import { Mappa, MappaPath } from "./comms/mappa";
import { Occupant, OccupantPath } from "./comms/occupant";
import { Uuid } from "../common/uuid";

/**
 * Lets other objects become [[Poolable]].
 */
export interface Pool {
	/**
	 * Actual instances here.
	 */
	instances: Map<Uuid, Instance>;

	/**
	 * Add instance to pool.
	 * @returns `true` on success, `false` on failure
	 */
	addInstance(instance: InstanceArgs): void;

	/**
	 * Gets the instance.
	 */
	getInstance(path: InstancePath): Instance;

	/**
	 * Gets the [[Locus]].
	 */
	getLocus(path: LocusPath): Locus;

	/**
	 * Gets the mappa.
	 */
	getMappa(path: MappaPath): Mappa;

	/**
	 * Gets the [[Occupant]].
	 */
	getOccupant(path: OccupantPath): Occupant;

	/**
	 * Remove instance from pool.
	 */
	removeInstance(instance: InstancePath): void;
}
