/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Ways to extends entities.
 *
 * @file
 */

import { Uuid } from "../../common/uuid";
import { ServerEntity, ServerEntityClass } from "./entity";

/**
 * A type that shares params between class factory and constructor.
 */
type EntityKindParams = {
	/**
	 * Kind props.
	 */
	props?: object;

	/**
	 * Vars is a record of UUIDs to be used in the kind, converted from IDs in files.
	 */
	vars?: Record<string, Uuid>;
};

/**
 * Parameters for factory generating a kind class.
 */
export type EntityKindClassFactoryParams = {
	/**
	 * Base class.
	 */
	Entity: ServerEntityClass;
} & EntityKindParams;

/**
 * Describes a factory function to generate kinds.
 */
export type EntityKindClassFactory = (params: EntityKindClassFactoryParams) => EntityKindClass;

/**
 * Constructor parameters for {@link EntityKind}.
 */
export type EntityKindConstructorParams = {
	/**
	 * Entity.
	 */
	entity: ServerEntity;
} & EntityKindParams;

/**
 * Entity kind.
 *
 * @remarks
 * The parameters are identical between all kinds, as we treat them the same as complete kinds. The extending classes are not necessarily aware if they are extending this, or another concrete kind.
 *
 * For the similar reason, the class is not abstract.
 */
export class EntityKind {
	/**
	 * Link to entity.
	 */
	public entity: ServerEntity;

	/**
	 * Kind can be stacked or not.
	 */
	public static isStackable: boolean = true;

	/**
	 * @param param - Destructured parameter
	 */
	public constructor({ entity }: EntityKindConstructorParams) {
		this.entity = entity;
	}

	/**
	 * Will be called on attachment of entity.
	 */
	// Here just to show the function to extending classes
	// eslint-disable-next-line class-methods-use-this
	public onAttachEntity(): void {
		// Does nothing
	}

	/**
	 * Will be called on creation of entity.
	 */
	// Here just to show the function to extending classes
	// eslint-disable-next-line class-methods-use-this
	public onCreateEntity(): void {
		// Does nothing
	}

	/**
	 * Will be called on termination of entity.
	 */
	// Here just to show the function to extending classes
	// eslint-disable-next-line class-methods-use-this
	public onTerminateEntity(): void {
		// Does nothing
	}
}

/**
 * Entity kind class.
 */
export type EntityKindClass = typeof EntityKind;
