/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cell
 */

import { defaultGridUuid, defaultShardUuid, entityUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { Vector } from "../common/vector";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgOptionsWithMap,
	CoreArgOptionsWithoutMap,
	CoreArgPath,
	CoreArgsContainer,
	coreArgPathConvert
} from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CommsEntity,
	CommsEntityArgs,
	CommsEntityRaw,
	CoreEntity,
	CoreEntityArgParentIds,
	CoreEntityArgs,
	EntityPathExtended,
	commsEntityRawToArgs,
	coreEntityArgsConvert
} from "./entity";
import { GridPath } from "./grid";
import {
	CoreUniverseObject,
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectContainerImplements,
	CoreUniverseObjectFactory,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit
} from "./universe-object";

// #region To be removed
/**
 * A location-like.
 */
export interface CommsCellArgs extends CellPathExtended, Vector {
	/**
	 * Array of entities.
	 */
	entities: Map<Uuid, CommsEntityArgs>;

	/**
	 * Worlds.
	 */
	worlds: Set<Uuid>;
}

/**
 * Helper for [[CommsCellRaw]].
 */
type CommCellRawHelper<A, B> = (A & B) | A;

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsCellRaw = CommCellRawHelper<
	Omit<CommsCellArgs, "entities" | "worlds" | keyof GridPath> & {
		/**
		 *
		 */
		entities: Array<CommsEntityRaw>;

		/**
		 *
		 */
		worlds?: Array<Uuid>;
	},
	Vector
>;

/**
 * Typeof class for cells.
 */
export type CoreCellClass = {
	/**
	 *
	 */
	new (...args: any[]): CommsCell;
};

/**
 * Cell implementable.
 */
export interface CommsCell extends CommsCellArgs {
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
	getEntity(path: EntityPathExtended): CommsEntity;

	/**
	 * Removes [[Entity]].
	 */
	removeEntity(path: EntityPathExtended): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Core cell.
 */
export type CoreCell = CommsCell & InstanceType<ReturnType<typeof CoreCellClassFactory>>;

/**
 * Converts [[CommsCellRaw]] to [[CommsCellArgs]].
 *
 * @param rawSource
 * @param path
 * @param rawSource
 * @param path
 */
export function commsCellRawToArgs(rawSource: CommsCellRaw, path: CellPathExtended): CommsCellArgs {
	return {
		...path,
		cellUuid: rawSource.cellUuid,
		entities: new Map(
			rawSource.entities.map(function (entity) {
				return [
					entity.entityUuid,
					commsEntityRawToArgs(entity, {
						...path,
						entityUuid: entity.entityUuid
					})
				];
			})
		),
		worlds: new Set(rawSource.worlds),
		x: rawSource.x,
		y: rawSource.y,
		z: rawSource.z
	};
}

/**
 *
 */
const coreCellArgsIndex: [CoreArgIds.Cell, CoreArgIds.Grid, CoreArgIds.Shard] = [
	CoreArgIds.Cell,
	CoreArgIds.Grid,
	CoreArgIds.Shard
];

/**
 * Index type for core cell args.
 */
type CoreCellArgsIndex = typeof coreCellArgsIndex;

/**
 * Cell own path.
 */
export type CellPathOwn = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathOwn, CoreCellArgParentIds>;

/**
 * Way to get to cell.
 */
export type CellPathExtended = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathExtended, CoreCellArgParentIds>;
// #endregion

// #region Core cell arg
/**
 * IDs of parents of {@link CoreCellArg}.
 */
export type CoreCellArgParentIds = typeof coreCellArgParentIds[number];

/**
 * Tuple with core cell arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
const coreCellArgParentIds = [CoreArgIds.Shard, CoreArgIds.Grid, CoreArgIds.Entity] as const;

/**
 * Unique set with parent ID's for core cell arg.
 */
export const coreCellArgParentIdSet: Set<CoreCellArgParentIds> = new Set(coreCellArgParentIds);

/**
 * Core cell args.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreCellArg<O extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Cell, O, CoreCellArgParentIds> &
	CoreArgsContainer<CoreEntityArgs<O>, CoreArgIds.Entity, O, CoreEntityArgParentIds> &
	(O[CoreArgOptionIds.Vector] extends true ? Vector : unknown) & {
		/**
		 * Worlds.
		 */
		worlds: O[CoreArgOptionIds.Map] extends true ? Set<Uuid> : Array<Uuid>;
	};
// #endregion

/**
 * Factory for core cell.
 *
 * @param param - Destructure parameter
 * @see {@link CoreBaseClassNonRecursive} for usage
 * @returns Cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreCellClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreUniverseObject<CoreArgIds.Entity, Options, CoreEntityArgParentIds>
>({
	Base,
	options
}: {
	/**
	 * Client base.
	 */
	Base: BaseClass;

	/**
	 * Options.
	 */
	options: Options;
}) {
	// Infer the new base for type safe return
	// eslint-disable-next-line @typescript-eslint/typedef
	const NewBase = CoreUniverseObjectFactory<
		BaseClass,
		CoreArgIds.Cell,
		Options,
		Entity,
		CoreArgIds.Entity,
		CoreCellArgParentIds
	>({
		Base,
		childId: CoreArgIds.Entity,
		grandparentIds: coreCellArgParentIdSet,
		options,
		parentId: CoreArgIds.Cell
	});

	/**
	 * New class to re-inject.
	 */
	type NewClass = typeof NewBase & typeof CoreCell;

	/**
	 * New instance type to use as `this`.
	 */
	type NewInstance = InstanceType<NewClass>;

	/**
	 * Core cell base class.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class CoreCell
		extends (NewBase as abstract new (...args: any[]) => any)
		implements CoreUniverseObjectContainerImplements<Entity, CoreArgIds.Entity, Options, CoreEntityArgParentIds>
	{
		/**
		 * Default entity.
		 */
		public abstract defaultEntity: Entity;

		/**
		 * Default entity UUID.
		 */
		public abstract defaultEntityUuid: Uuid;

		/**
		 * Gets default entity UUID.
		 *
		 * @param param - Destructure parameter
		 * @returns Default entity UUID
		 */
		public static getDefaultEntityUuid({ cellUuid }: Pick<CellPathExtended, "cellUuid">): Uuid {
			return getDefaultUuid({
				path: `${entityUuidUrlPath}${urlPathSeparator}${cellUuid}`
			});
		}

		/**
		 * Attach {@link CoreEntity} to {@link CoreCell}.
		 *
		 * @param this - This will match when called with static options
		 * @param entity - {@link CoreEntity}, anything that resides within a cell
		 */
		public attach(this: NewInstance, entity: Entity): void {
			this.entities.set(entity.entityUuid, entity);
		}

		/**
		 * Detach {@link CoreEntity} from {@link CoreCell}.
		 *
		 * @param this  - This will match when called with static options
		 * @param param - Destructure parameter
		 * @returns If deletion was successful or not
		 */
		public detach(this: NewInstance, { entityUuid }: CoreEntity): boolean {
			if (this.entities.has(entityUuid)) {
				this.entities.delete(entityUuid);
				return true;
			}
			return false;
		}
	}

	// Have to re-inject dynamic bits from generic parents
	return CoreCell as NewClass;
}

/**
 * Convert cell args between options.
 *
 * Has to strictly follow {@link CoreCellArg}.
 *
 * @param param - Destructured parameter
 * @returns Converted cell args
 */
export function coreCellArgsConvert<
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion
>({
	cell,
	sourceOptions,
	targetOptions,
	meta
}: {
	/**
	 * Core cell args.
	 */
	cell: CoreCellArg<SourceOptions>;

	/**
	 * Option for the source.
	 */
	sourceOptions: SourceOptions;

	/**
	 * Option for the target.
	 */
	targetOptions: TargetOptions;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<CoreArgIds.Cell, SourceOptions, TargetOptions, CoreCellArgParentIds>;
}): CoreCellArg<TargetOptions> {
	// Cannot assign to conditional type without casting
	let targetCell: CoreCellArg<TargetOptions> = {} as CoreCellArg<TargetOptions>;

	// Assign the path
	Object.assign(
		targetCell,
		coreArgPathConvert({
			id: CoreArgIds.Cell,
			meta,
			parentIds: coreCellArgParentIdSet,
			sourceArgPath: cell,
			sourceOptions,
			targetOptions
		})
	);

	// Vector
	if (targetOptions[CoreArgOptionIds.Vector] === true) {
		/**
		 * Core cell args with vector.
		 */
		type CoreCellArgsWithVector = CoreCellArg<CoreArgOptionsGenerate<CoreArgOptionIds.Vector>>;
		let targetCellWithVector: CoreCellArgsWithVector = emptyTargetCell as CoreCellArgsWithVector;

		if (sourceOptions[CoreArgOptionIds.Vector] === true) {
			// Source to target
			const sourceCellWithVector: CoreCellArgsWithVector = cell as Record<string, any> as CoreCellArgsWithVector;
			targetCellWithVector.x = sourceCellWithVector.x;
			targetCellWithVector.y = sourceCellWithVector.y;
			targetCellWithVector.z = sourceCellWithVector.z;
		} else {
			// Default to target
			targetCellWithVector.x = 0;
			targetCellWithVector.y = 0;
			targetCellWithVector.z = 0;
		}
	}

	/**
	 * Core cell args with map.
	 */
	type CoreCellArgsWithMap = CoreCellArg<CoreArgOptionsWithMap>;

	/**
	 * Core cell args without map.
	 */
	type CoreCellArgsWithoutMap = CoreCellArg<CoreArgOptionsWithoutMap>;

	// Map
	if (targetOptions[CoreArgOptionIds.Map] === true) {
		let targetCellWithMap: CoreCellArgsWithMap = emptyTargetCell as CoreCellArgsWithMap;

		// Worlds
		targetCellWithMap.worlds = new Set(cell.worlds);

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Map to map
			const sourceCellWithMap: CoreCellArgsWithMap = cell as CoreCellArgsWithMap;

			// Entities
			targetCellWithMap.entities = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(sourceCellWithMap.entities, ([uuid, entity]) => [
					uuid,
					coreEntityArgsConvert({
						entity,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreArgOptionsWithMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreArgOptionsWithMap
					})
				])
			);
		} else {
			// Array to map
			const sourceCellWithoutMap: CoreCellArgsWithoutMap = cell as CoreCellArgsWithoutMap;

			// Entities
			targetCellWithMap.entities = new Map(
				sourceCellWithoutMap.entities.map(entity => [
					entity.entityUuid,
					coreEntityArgsConvert({
						entity,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreArgOptionsWithoutMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreArgOptionsWithMap
					})
				])
			);
		}
	} else {
		let targetCellWithoutMap: CoreCellArgsWithoutMap = cell as CoreCellArgsWithoutMap;

		// Worlds
		targetCellWithoutMap.worlds = Array.from(cell.worlds);

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Map to array
			const sourceCellWithMap: CoreCellArgsWithMap = cell as CoreCellArgsWithMap;

			// Entities
			targetCellWithoutMap.entities = Array.from(
				sourceCellWithMap.entities,
				// Argument types correctly inferred from "Array.from()", probably eslint bug, and UUID is unused
				// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
				([uuid, entity]) =>
					// Set to actual type
					coreEntityArgsConvert({
						entity,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreArgOptionsWithMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreArgOptionsWithoutMap
					})
			);
		} else {
			// Array to array
			const sourceCellWithoutMap: CoreCellArgsWithoutMap = cell as CoreCellArgsWithoutMap;

			// Entities
			targetCellWithoutMap.entities = sourceCellWithoutMap.entities.map(entity =>
				// Set to actual type
				coreEntityArgsConvert({
					entity,
					// Cast to expected type
					sourceOptions: sourceOptions as CoreArgOptionsWithoutMap,
					// Cast to expected type
					targetOptions: targetOptions as CoreArgOptionsWithoutMap
				})
			);
		}
	}
	// Return
	return emptyTargetCell as CoreCellArg<TargetOptions>;
}
