/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import { boolean } from "fp-ts";
import { defaultCellUuid, defaultGridUuid, defaultKindUuid, defaultShardUuid } from "../common/defaults";
import { ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CoreArgsIds, CoreArgsIdsToOptions, CoreArgsOptionsUnion } from "./args";
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
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArgs<O extends CoreArgsOptionsUnion> = (O[CoreArgsIds.Path] extends true
	? EntityPath
	: EntityOwnPath) & {
	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & (O[CoreArgsIds.Kind] extends true
		? {
				/**
				 * Kind of entity.
				 */
				kindUuid: Uuid;
		  }
		: unknown);

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
 * Path to an entity only.
 */
export interface EntityOwnPath {
	/**
	 * Cell uuid.
	 */
	entityUuid: Uuid;
}

/**
 * Path to an entity.
 */
export interface EntityPath extends CellPath, EntityOwnPath {}

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
		 * Move entity to a different cell.
		 *
		 * @param cellPath - Path to the target cell
		 *
		 * @returns If successful or not
		 */
		public move(cellPath: CellPath): boolean {
			// Locate cells
			let sourceCell: CoreCell = (this as CoreBase).universe.getCell(this);
			let targetCell: CoreCell = (this as CoreBase).universe.getCell(cellPath);

			// Reattach
			if (sourceCell.detach(this)) {
				this.doMove(targetCell);
				return true;
			}
			return false;
		}

		/**
		 * Terminate.
		 */
		public abstract terminate(): void;

		/**
		 * Perform move to a cell unconditionally, without detaching.
		 *
		 * @param cell - Target cell
		 */
		protected doMove(cell: CoreCell): void {
			this.shardUuid = cell.shardUuid;
			this.gridUuid = cell.gridUuid;
			this.cellUuid = cell.cellUuid;
			cell.attach(this);
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

/**
 * Converts entity args between options.
 *
 * Has to strictly follow {@link CoreEntityArgs}.
 *
 * @returns Target args entity
 */
export function coreEntityArgsConvert<S extends CoreArgsOptionsUnion, T extends CoreArgsOptionsUnion>({
	entity,
	sourceOptions,
	targetOptions
}: {
	/**
	 * Source options.
	 */
	sourceOptions: S;

	/**
	 * Target options.
	 */
	targetOptions: T;

	/**
	 * Target source entity.
	 */
	entity: CoreEntityArgs<S>;
}): CoreEntityArgs<T> {
	// Define source and result, with minimal options
	const sourceEntity: CoreEntityArgs<S> = entity;
	const sourceEntityAs: Record<string, any> = sourceEntity;
	// Cannot assign to conditional type without casting
	let targetEntity: CoreEntityArgs<T> = {
		entityUuid: sourceEntity.entityUuid,
		modeUuid: sourceEntity.modeUuid,
		worldUuid: sourceEntity.worldUuid
	} as CoreEntityArgs<T>;
	let targetEntityAs: Record<string, any> = targetEntity;

	// Path
	if (targetOptions[CoreArgsIds.Path] === true) {
		/**
		 * Entity with path.
		 */
		type EntityWithPath = CoreEntityArgs<CoreArgsIdsToOptions<CoreArgsIds.Path>>;
		let targetEntityWithPath: EntityWithPath = targetEntityAs as EntityWithPath;
		if (sourceOptions[CoreArgsIds.Path] === true) {
			const sourceEntityWithPath: EntityWithPath = sourceEntityAs as EntityWithPath;
			targetEntityWithPath.shardUuid = sourceEntityWithPath.shardUuid;
			targetEntityWithPath.gridUuid = sourceEntityWithPath.gridUuid;
			targetEntityWithPath.cellUuid = sourceEntityWithPath.cellUuid;
		} else {
			targetEntityWithPath.shardUuid = defaultShardUuid;
			targetEntityWithPath.gridUuid = defaultGridUuid;
			targetEntityWithPath.cellUuid = defaultCellUuid;
		}
	}

	// Kind
	if (targetOptions[CoreArgsIds.Kind] === true) {
		/**
		 * Entity with kind.
		 */
		type EntityWithKind = CoreEntityArgs<CoreArgsIdsToOptions<CoreArgsIds.Kind>>;
		let targetEntityWithKind: EntityWithKind = targetEntityAs as EntityWithKind;
		if (sourceOptions[CoreArgsIds.Kind] === true) {
			targetEntityWithKind.kindUuid = (sourceEntityAs as EntityWithKind).kindUuid;
		} else {
			targetEntityWithKind.kindUuid = defaultKindUuid;
		}
	}

	// Return
	return targetEntity;
}
