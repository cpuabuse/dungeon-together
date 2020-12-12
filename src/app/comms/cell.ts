/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Cell.
 */

import { CommsEntity, CommsEntityArgs, CommsEntityRaw, EntityPath } from "./entity";
import { CommsProto } from "./proto";
import { GridPath } from "./grid";
import { Uuid } from "../common/uuid";
import { Vector } from "../common/vector";

/**
 * A location-like.
 */
export interface CommsCellArgs extends CellPath, Vector {
	/**
	 * Array of entities.
	 */
	entities: Map<Uuid, CommsEntityArgs>;

	/**
	 * Worlds
	 */
	worlds: Set<Uuid>;
}

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsCellRaw = Omit<CommsCellArgs, "cells" | keyof GridPath> & {
	entities: Array<CommsEntityRaw>;
};

/**
 * Cell implementable.
 */
export interface CommsCell extends CommsCellArgs, CommsProto {
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
