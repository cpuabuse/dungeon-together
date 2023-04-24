/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Ways to extends entities.
 *
 * @file
 */

import { Uuid } from "../../common/uuid";
import { Nav } from "../../core/arg";
import { ActionWords } from "../action";
import { ServerCell } from "../cell";
import { ServerGrid } from "../grid";
import { ServerUniverse } from "../universe";
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
 * Parameters for entity kind action.
 */
export type EntityKindActionArgs = {
	/**
	 * Action name.
	 */
	action: ActionWords;

	/**
	 * Source server entity.
	 */
	sourceEntity?: ServerEntity;

	/**
	 * Tool used in action.
	 */
	toolEntity?: ServerEntity;
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
		 * Per entity emits, that will be sent to client, to be interpreted.
		 *
		 * @remarks
		 * Must be a getter, so that getter inheritance works.
		 *
		 * @returns Empty object
		 */
		// A dummy
		// eslint-disable-next-line class-methods-use-this
		public get emits(): Record<string, any> {
			return {};
		}

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
		 * Per-kind on tick method.
		 *
		 * @remarks
		 * Should not call super, as registered kinds will all be ticked, including base.
		 * Should be called in order of registration.
		 */
		public static onTick(): void {
			// Do nothing
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		// Dummy function
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public action(param: EntityKindActionArgs): boolean {
			// Does nothing
			return false;
		}

		/**
		 * Actually moves the server entity.
		 *
		 * @param targetCell - Cell
		 * @returns Whether move was successful
		 */
		public moveEntity(targetCell: ServerCell): boolean {
			// Docs not necessary for const type
			// eslint-disable-next-line jsdoc/require-jsdoc
			const { entity }: { entity: ServerEntity } = this;

			// Reattach; Attach will update uuids in core
			(this.entity.constructor as ServerEntityClass).universe.getCell(entity).detachEntity(entity);
			targetCell.attachEntity(entity);

			return true;
		}

		/**
		 * Tries to move entity via navigation.
		 *
		 * @param param - Destructured parameter
		 */
		public navigateEntity({
			nav
		}: {
			/**
			 * Nav direction.
			 */
			nav: Nav;
		}): void {
			const { universe }: Record<"universe", ServerUniverse> = this.entity.constructor as ServerEntityClass;
			const grid: ServerGrid = universe.getGrid(this.entity);
			const sourceCell: ServerCell = universe.getCell(this.entity);
			const targetCell: ServerCell = grid.getCell(sourceCell.nav.get(nav) ?? this.entity);
			if (this.moveEntity(targetCell)) {
				sourceCell.addEvent({
					name: "trail",
					targetCellUuid: targetCell.cellUuid,
					targetEntityUuid: this.entity.entityUuid
				});
			}
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
		 * Will be called on detachment of entity.
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this
		public onDetachEntity(): void {
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
