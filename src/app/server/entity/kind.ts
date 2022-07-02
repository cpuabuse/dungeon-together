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
import { ServerCell } from "../cell";
import { ServerEntity, ServerEntityClass } from "./entity";

/**
 * A type that shares params between class factory and constructor.
 */
type EntityKindParams = {
	/**
	 * Kind props.
	 */
	props?: Record<string, unknown>;

	/**
	 * Vars is a record of UUIDs to be used in the kind, converted from IDs in files.
	 */
	vars?: Record<string, Uuid>;
};

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
	props?: Record<string, unknown>;

	/**
	 * Vars is a record of UUIDs to be used in the kind, converted from IDs in files.
	 */
	vars?: Record<string, Uuid>;
};

/**
 * Factory for base kind.
 *
 * @param param - Destructured parameter
 * @returns Base kind class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BaseEntityKindClassFactory({
	Entity
}: {
	/**
	 * Server entity class.
	 */
	Entity: ServerEntityClass;
}) {
	/**
	 * Entity kind.
	 *
	 * @remarks
	 * The parameters are identical between all kinds, and we treat base kind and concrete kinds identically, for simplicity.
	 *
	 * For the similar reason, the class is not abstract.
	 */
	class BaseKind implements EntityKindParams {
		/**
		 * Server entity class.
		 *
		 * @remarks
		 * Even though entity class is accessible through entity constructor, it might be necessary to access it from a static method.
		 */
		public static Entity: ServerEntityClass = Entity;

		/**
		 * Link to entity.
		 */
		public entity: ServerEntity;

		/**
		 * Props.
		 */
		public props: EntityKindParams["props"];

		/**
		 * Vars.
		 */
		public vars: EntityKindParams["vars"];

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity }: EntityKindConstructorParams) {
			this.entity = entity;
		}

		/**
		 * Actually moves the server entity.
		 *
		 * @param cell - Cell
		 */
		public moveEntity(cell: ServerCell): void {
			// Docs not necessary for const type
			// eslint-disable-next-line jsdoc/require-jsdoc
			const { entity }: { entity: ServerEntity } = this;

			// Reattach; Attach will update uuids in core
			BaseKind.Entity.universe.getCell(entity).detachEntity(entity);
			cell.attachEntity(entity);
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

	return BaseKind;
}

/**
 * Entity kind class.
 */
export type EntityKindClass = ReturnType<typeof BaseEntityKindClassFactory>;

/**
 * Instance type of entity kind class.
 */
export type EntityKind = InstanceType<EntityKindClass>;
