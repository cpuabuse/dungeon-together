/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Cell.
 */

import { CommsEntity, CommsEntityArgs, EntityPath } from "./comms-entity";
import { GridPath } from "./comms-grid";
import { Uuid } from "../../common/uuid";
import { Vector } from "../../common/vector";

/**
 * A location-like.
 */
export interface CommsCellArgs extends CellPath, Vector {
	/**
	 * Array of entities.
	 */
	occupants: Map<Uuid, CommsEntityArgs>;

	/**
	 * Worlds
	 */
	worlds: Set<Uuid>;
}

/**
 * Cell implementable.
 */
export interface CommsCell extends CommsCellArgs {
	/**
	 * Default [[Entity]] UUID.
	 */
	defaultEntityUuid: Uuid;

	/**
	 * Adds [[Entity]].
	 */
	addEntity(entity: CommsEntityArgs): void;

	/**
	 * Gets [[Entity]].
	 */
	getEntity(path: EntityPath): CommsEntity;

	/**
	 * Removes [[Entity]].
	 */
	removeEntity(path: EntityPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Way to get to cell.
 */
export interface CellPath extends GridPath {
	/**
	 * Cell uuid.
	 */
	cellUuid: Uuid;
}
