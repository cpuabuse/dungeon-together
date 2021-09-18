/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import { ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CellPath } from "./cell";

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
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsEntityRaw = Omit<CommsEntityArgs, keyof CellPath>;

/**
 * Typeof class for entities.
 *
 * It may be abstract.
 */
export type CoreEntityClass = ToAbstract<{
	new (...args: any[]): CommsEntity;
}>;

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
 * Core entity type.
 */
export type CoreEntity = CommsEntity;

/**
 * Path to an entity.
 */
export interface EntityPath extends CellPath {
	/**
	 * Cell uuid.
	 */
	entityUuid: Uuid;
}

/**
 * @param rawSource
 * @param path
 */
export function commsEntityRawToArgs(rawSource: CommsEntityRaw, path: EntityPath): CommsEntityArgs {
	return {
		...path,
		...rawSource
	};
}
