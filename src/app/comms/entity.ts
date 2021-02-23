/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import { Uuid } from "../common/uuid";
import { CellPath } from "./cell";
import { CommsProto } from "./proto";

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
 * Implementable [[CommsEntityArgs]].
 */
export interface CommsEntity extends CommsEntityArgs, CommsProto {
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
