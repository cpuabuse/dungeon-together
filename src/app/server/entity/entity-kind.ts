/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Ways to extends entities.
 *
 * @file
 */

import { FromAbstract } from "../../common/utility-types";
import { Uuid } from "../../common/uuid";
import { ServerEntity } from "./entity";

/**
 * Constructor parameters for {@link EntityKind}.
 */
export type EntityKindConstructorParams = {
	/**
	 * Entity.
	 */
	entity: ServerEntity;

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
 * Entity kind.
 */
export abstract class EntityKind {
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
 * Abstract entity kind class.
 */
export type EntityKindClassAbstract = typeof EntityKind;

/**
 * Entity kind class.
 */
export type EntityKindClassConcrete = FromAbstract<typeof EntityKind>;

/**
 * Describes a factory function to generate kinds.
 */
export type EntityKindClassFactory = ({
	Base
}: {
	/**
	 * Base class.
	 */
	Base: EntityKindClassAbstract;
}) => EntityKindClassConcrete;
