/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Entity.
 */

import {
	defaultCellUuid,
	defaultGridUuid,
	defaultKindUuid,
	defaultShardUuid,
	entityUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { ToAbstract } from "../common/utility-types";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { CoreArg, CoreArgIds, CoreArgOptionsPathExtended, CoreArgOptionsPathOwn, CoreArgPath } from "./arg";
import { CoreArgOptionIds, CoreArgOptionsGenerate, CoreArgOptionsUnion } from "./arg/options";
import { CoreBase, CoreBaseClass, CoreBaseClassNonRecursive } from "./base";
import { CellPathExtended, CoreCell, CoreCellArgParentIds } from "./cell";
import {
	CoreUniverseObject,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit
} from "./universe-object";

// #region To be removed
/**
 * Word referring to entity.
 */
export type CoreEntityWord = "Entity";

/**
 * An object-like.
 */
export interface CommsEntityArgs extends EntityPathExtended {
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
export type CommsEntityRaw = Omit<CommsEntityArgs, keyof CellPathExtended>;

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
// #endregion

/**
 * {@link CoreEntityArgs} parent IDs.
 */
export type CoreEntityArgParentIds = CoreCellArgParentIds | CoreArgIds.Cell;

/**
 * Path to an entity only.
 */
export type EntityPathOwn = CoreArgPath<CoreArgIds.Entity, CoreArgOptionsPathOwn, CoreEntityArgParentIds>;

/**
 * Path to an entity.
 */
export type EntityPathExtended = CoreArgPath<CoreArgIds.Entity, CoreArgOptionsPathExtended, CoreEntityArgParentIds>;

/**
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArgs<O extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Entity, O, CoreEntityArgParentIds> & {
	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & (O[CoreArgOptionIds.Kind] extends true
		? {
				/**
				 * Kind of entity.
				 */
				kindUuid: Uuid;
		  }
		: unknown);

/**
 * Core entity class factory.
 *
 * @param param
 * @see {@link CoreBaseClassNonRecursive} for usage
 * @returns Core entity class
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreEntityClassFactory<
	C extends CoreBaseClassNonRecursive = CoreBaseClass,
	O extends CoreArgOptionsUnion = CoreArgOptions
>({
	Base,
	options
}: {
	/**
	 * Client base.
	 */
	Base: C;

	/**
	 * Options.
	 */
	options: O;
}) {
	/**
	 * Entity type extracted from entity class.
	 */
	type Entity = C extends {
		/**
		 * Universe.
		 */
		universe: {
			/**
			 * Entity class.
			 */
			Entity: infer T;
		};
	}
		? T extends CoreEntityClass
			? InstanceType<T>
			: CoreEntity
		: CoreEntity;

	/**
	 * Core entity.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	abstract class CoreEntity extends Base implements CoreUniverseObject<CoreEntityWord> {
		/**
		 * Cell UUID.
		 */
		public abstract cellUuid: Uuid;

		/**
		 * Default entity.
		 */
		public abstract defaultEntity: Entity;

		/**
		 * Default entity UUID.
		 */
		public abstract defaultEntityUuid: Uuid;

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
		 * Gets default entity UUID.
		 *
		 * @param param
		 * @returns Default entity UUID
		 */
		public static getDefaultEntityUuid({ entityUuid }: EntityPathOwn): Uuid {
			return getDefaultUuid({
				path: `${entityUuidUrlPath}${urlPathSeparator}${entityUuid}`
			});
		}

		/**
		 * Move entity to a different cell.
		 *
		 * @param cellPath - Path to the target cell
		 * @returns If successful or not
		 */
		public move(cellPath: CellPathExtended): boolean {
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
export function commsEntityRawToArgs(rawSource: CommsEntityRaw, path: EntityPathExtended): CommsEntityArgs {
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
 * @param param
 * @returns Target args entity
 */
export function coreEntityArgsConvert<S extends CoreArgOptionsUnion, T extends CoreArgOptionsUnion>({
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
	if (targetOptions[CoreArgOptionIds.Path] === true) {
		/**
		 * Entity with path.
		 */
		type EntityWithPath = CoreEntityArgs<CoreArgOptionsGenerate<CoreArgOptionIds.Path>>;
		let targetEntityWithPath: EntityWithPath = targetEntityAs as EntityWithPath;
		if (sourceOptions[CoreArgOptionIds.Path] === true) {
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
	if (targetOptions[CoreArgOptionIds.Kind] === true) {
		/**
		 * Entity with kind.
		 */
		type EntityWithKind = CoreEntityArgs<CoreArgOptionsGenerate<CoreArgOptionIds.Kind>>;
		let targetEntityWithKind: EntityWithKind = targetEntityAs as EntityWithKind;
		if (sourceOptions[CoreArgOptionIds.Kind] === true) {
			targetEntityWithKind.kindUuid = (sourceEntityAs as EntityWithKind).kindUuid;
		} else {
			targetEntityWithKind.kindUuid = defaultKindUuid;
		}
	}

	// Return
	return targetEntity;
}
