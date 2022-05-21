/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Grid
 */

import { ComputedClassWords } from "../common/computed-class";
import { defaultShardUuid } from "../common/defaults";
import { AbstractConstructor, StaticImplements, StaticMembers } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	CoreArgsContainer
} from "./arg";
import { CoreArgOptionIds, CoreArgOptionsGenerate, CoreArgOptionsUnion } from "./arg/options";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CellPathExtended,
	CommsCell,
	CommsCellArgs,
	CommsCellRaw,
	CoreCell,
	CoreCellArg,
	CoreCellArgParentIds,
	commsCellRawToArgs
} from "./cell";
import { ShardPath, coreShardArgParentIds } from "./shard";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectInstance
} from "./universe-object";

// #region To be removed
/**
 * Word referring to a grid.
 */
export type CoreGridWord = "Grid";

/**
 * A grid-like.
 */
export interface CommsGridArgs extends GridPathExtended {
	/**
	 * Locations within the grid.
	 */
	cells: Map<Uuid, CommsCellArgs>;
}

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsGridRaw = Omit<CommsGridArgs, "cells" | keyof ShardPath> & {
	/**
	 * Legacy.
	 */
	cells: Array<CommsCellRaw>;
};

/**
 * Typeof class for grids.
 */
export type CoreGridClass = {
	new (...args: any[]): CommsGrid;
};

/**
 * Implementable [[CommsGridArgs]].
 */
export interface CommsGrid extends CommsGridArgs {
	/**
	 * Default [[Cell]] UUID.
	 */
	defaultCellUuid: Uuid;

	/**
	 * Adds [[CommsCell]].
	 */
	addCell(grid: CommsCellArgs): void;

	/**
	 * Gets [[CommsCell]].
	 */
	getCell(path: CellPathExtended): CommsCell;

	/**
	 * Removes [[CommsCell]].
	 */
	removeCell(path: CellPathExtended): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Converts [[CommsGridRaw]] to [[CommsGridArgs]].
 *
 * @param rawSource - Legacy
 * @param shardUuid - Legacy
 * @returns - Legacy
 */
export function commsGridRawToArgs(rawSource: CommsGridRaw, shardUuid: Uuid): CommsGridArgs {
	return {
		cells: new Map(
			// Legacy
			// eslint-disable-next-line @typescript-eslint/typedef
			rawSource.cells.map(function (cell) {
				return [
					cell.cellUuid,
					commsCellRawToArgs(cell, { cellUuid: cell.cellUuid, gridUuid: rawSource.gridUuid, shardUuid })
				];
			})
		),
		gridUuid: rawSource.gridUuid,
		shardUuid
	};
}
// #endregion

/**
 * Tuple with core grid arg grandparent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
const coreGridArgGrandparentIds = [...coreShardArgParentIds] as const;

/**
 * Tuple with core grid arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
export const coreGridArgParentIds = [...coreShardArgParentIds, CoreArgIds.Shard] as const;

/**
 * Unique set with grandparent ID's for core cell arg.
 */
export const coreGridArgGrandparentIdSet: Set<CoreGridArgGrandparentIds> = new Set(coreGridArgGrandparentIds);

/**
 * Unique set with parent ID's for core cell arg.
 */
export const coreGridArgParentIdSet: Set<CoreGridArgParentIds> = new Set(coreGridArgParentIds);

/**
 * IDs of grandparents of {@link CoreGridArg}.
 */
export type CoreGridArgGrandparentIds = typeof coreGridArgGrandparentIds[number];

/**
 * IDs of parents of {@link CoreCellArg}.
 */
export type CoreGridArgParentIds = typeof coreGridArgParentIds[number];

/**
 * Grid's own path.
 */
export type GridPathOwn = CoreArgPath<CoreArgIds.Grid, CoreArgOptionsPathOwn, CoreGridArgParentIds>;

/**
 * Way to get to grid.
 */
export type GridPathExtended = CoreArgPath<CoreArgIds.Grid, CoreArgOptionsPathExtended, CoreGridArgParentIds>;

/**
 * Core grid args.
 */
export type CoreGridArg<Options extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Grid, Options, CoreGridArgParentIds> &
	CoreArgsContainer<CoreCellArg<Options>, CoreArgIds.Cell, Options, CoreCellArgParentIds>;

/**
 * Core grid.
 */
export type CoreGrid<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Cell extends CoreCell<BaseClass, Options> = CoreCell<BaseClass, Options>
> = CoreGridArg<Options> &
	CoreUniverseObjectInstance<
		BaseClass,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreArgIds.Shard,
		CoreGridArgGrandparentIds,
		Cell,
		CoreArgIds.Cell
	>;

/**
 * Core grid class factory.
 *
 * @param param - Destructured parameter
 * @returns Grid
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreGridClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Cell extends CoreCell<BaseClass, Options>
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
	/**
	 * Core universe object constructor params for grid.
	 */
	type GridParams = CoreUniverseObjectConstructorParameters<
		BaseClass,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreGridArgParentIds
	>;

	/**
	 * Parameter constraint for class to extend.
	 */
	type SuperConstructorExtends = AbstractConstructor<GridParams>;

	/**
	 * Super class.
	 *
	 * @remarks
	 * Constrains actual super class to extends to be used, if fails, the return result will be never.
	 */
	type SuperClass = typeof NewBase extends SuperConstructorExtends ? typeof NewBase : never;

	/**
	 * Constructor params.
	 */
	type ConstructorParams = GridParams;

	/**
	 * Class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreGridClassConstraintData<BaseClass, Options, Cell>,
		ComputedClassActualData<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: ComputedClassActualMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: InstanceType<SuperClass>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: Grid;
			};

			/**
			 * Static.
			 */
			[ComputedClassWords.Static]: ComputedClassActualMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: StaticMembers<SuperClass>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: StaticMembers<typeof Grid>;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * New class to re-inject.
	 */
	// Intersection preserves constructor parameters of core cell, and instance type of base class
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	// Infer the new base for type safe return
	// eslint-disable-next-line @typescript-eslint/typedef
	const NewBase = CoreUniverseObjectFactory<
		BaseClass,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreArgIds.Shard,
		CoreGridArgGrandparentIds,
		Cell,
		CoreCellArg<Options>,
		CoreArgIds.Cell
	>({
		Base,
		childId: CoreArgIds.Cell,
		grandparentIds: coreGridArgGrandparentIdSet,
		id: CoreArgIds.Grid,
		options,
		parentId: CoreArgIds.Shard
	});

	/**
	 * Core cell base class.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class Grid
		// Casting will remove non-static instance information by intersecting with `any`, while maintaining constructor parameters, that will be included into factory return
		extends (NewBase as SuperConstructorExtends)
		implements StaticImplements<ActualClassInfo[ComputedClassWords.ClassImplements], typeof Grid>
	{
		/**
		 * Default entity.
		 */
		public abstract defaultCell: Cell;
	}

	// Have to re-inject dynamic bits from generic parents
	return Grid as ReturnClass;
}

/**
 * Convert grid args between options.
 *
 * Has to strictly follow {@link CoreGridArg}.
 *
 * @param param
 * @returns Converted grid args
 */
export function coreGridArgsConvert<
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion
>({
	grid,
	sourceOptions,
	targetOptions,
	meta
}: {
	/**
	 * Core grid args.
	 */
	grid: CoreGridArg<SourceOptions>;

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
	meta: CoreArgMeta<CoreArgIds.Grid, SourceOptions, TargetOptions, CoreGridArgParentIds>;
}): CoreGridArg<TargetOptions> {
	// Define source and result, with minimal options
	const sourceGrid: CoreGridArg<SourceOptions> = grid;
	const sourceGridAs: Record<string, any> = sourceGrid;
	// Cannot assign to conditional type without casting
	let targetGrid: CoreGridArg<TargetOptions> = {
		gridUuid: sourceGrid.gridUuid
	};

	// Path
	if (targetOptions[CoreArgOptionIds.Path] === true) {
		/**
		 * Core grid args with path.
		 */
		type CoreGridArgsWithPath = CoreGridArg<CoreArgOptionsGenerate<CoreArgOptionIds.Path>>;
		let targetGridWithPath: CoreGridArgsWithPath = targetGridAs as CoreGridArgsWithPath;

		if (sourceOptions[CoreArgOptionIds.Path] === true) {
			// Source to target
			targetGridWithPath.shardUuid = (sourceGridAs as CoreGridArgsWithPath).shardUuid;
		} else {
			// Default to target
			targetGridWithPath.shardUuid = defaultShardUuid;
		}
	}

	/**
	 * Core grid args options with map.
	 */
	type CoreGridArgsOptionsWithMap = CoreArgOptionsGenerate<CoreArgOptionIds.Map>;

	/**
	 * Core grid args options without map.
	 */
	type CoreGridArgsOptionsWithoutMap = CoreArgOptions;

	/**
	 * Core grid args with map.
	 */
	type CoreGridArgsWithMap = CoreGridArg<CoreGridArgsOptionsWithMap>;

	/**
	 * Core grid args without map.
	 */
	type CoreGridArgsWithoutMap = CoreGridArg<CoreGridArgsOptionsWithoutMap>;

	// Return
	return targetGrid;
}
