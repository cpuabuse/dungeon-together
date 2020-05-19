/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Instance.
 */

import { Mappa, MappaArgs, MappaPath } from "./mappa";
import { Uuid } from "../../common/uuid";

/**
 * Everything-like.
 */
export interface InstanceArgs extends InstancePath {
	/**
	 * Locations.
	 */
	mappas: Map<Uuid, MappaArgs>;
}

/**
 * Interface as basis for class implementation.
 */
export interface Instance extends InstanceArgs {
	/**
	 * Default [[Mappa]] UUID.
	 */
	defaultMappaUuid: Uuid;

	/**
	 * Adds [[Mappa]].
	 */
	addMappa(mappa: MappaArgs): void;

	/**
	 * Gets [[Mappa]].
	 */
	getMappa(path: MappaPath): Mappa;

	/**
	 * Removes [[Mappa]].
	 */
	removeMappa(path: MappaPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Way to get to instance.
 */
export interface InstancePath {
	/**
	 * Instance uuid.
	 */
	instanceUuid: Uuid;
}
