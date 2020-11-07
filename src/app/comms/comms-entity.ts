/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import { CellPath } from "./comms-cell";
import { Uuid } from "../common/uuid";

/**
 * An object-like.
 */
export interface CommsEntityArgs extends EntityPath {
	/**
	 * Kind of entity.
	 */
	kindUuid: Uuid;

	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
}

/**
 * Implementable [[CommsEntityArgs]].
 */
export interface CommsEntity extends CommsEntityArgs {
	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Path to an entity.
 */
export interface EntityPath extends CellPath {
	/**
	 * Cell uuid.
	 */
	entityUuid: Uuid;
}
