/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import { ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CoreBase, CoreBaseClass, CoreBaseClassNonRecursive } from "./base";
import { CellPath, CoreCell } from "./cell";

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
 * Core entity class factory.
 *
 * @see {@link CoreBaseClassNonRecursive} for usage
 *
 * @returns Core entity class
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreEntityClassFactory<C extends CoreBaseClassNonRecursive = CoreBaseClass>({
	Base
}: {
	/**
	 * Base to extend.
	 */
	Base: C;
}) {
	/**
	 * Core entity.
	 */
	abstract class CoreEntity extends Base {
		/**
		 * Cell UUID.
		 */
		public abstract cellUuid: Uuid;

		/**
		 * Entity UUID.
		 */
		public abstract entityUuid: Uuid;

		/**
		 * Grid UUID.
		 */
		public abstract gridUuid: Uuid;

		/**
		 * Kind of entity.
		 */
		public abstract kindUuid: Uuid;

		/**
		 * Mode of the entity.
		 */
		public abstract modeUuid: Uuid;

		/**
		 * Shard UUID.
		 */
		public abstract shardUuid: Uuid;

		/**
		 * World in which entity resides.
		 */
		public abstract worldUuid: Uuid;

		/**
		 * Terminate.
		 */
		public abstract terminate(): void;

		/**
		 * Move entity to a different cell.
		 *
		 * @param cellPath - Path to the target cell
		 *
		 * @returns If successful or not
		 */
		protected move(cellPath: CellPath): boolean {
			// Locate cells
			let sourceCell: CoreCell = (this as CoreBase).universe.getCell(this);
			let targetCell: CoreCell = (this as CoreBase).universe.getCell(cellPath);

			// Reattach
			if (sourceCell.detach(this)) {
				this.shardUuid = targetCell.shardUuid;
				this.gridUuid = targetCell.gridUuid;
				this.cellUuid = targetCell.cellUuid;
				targetCell.attach(this);
				return true;
			}
			return false;
		}
	}

	return CoreEntity;
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
