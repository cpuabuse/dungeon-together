/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Grid
 */

import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { StaticImplements, ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { Vector, VectorArray } from "../common/vector";
import {
	CoreArgComplexOptionPathIds,
	CoreArgContainerArg,
	CoreArgConvertContainerLink,
	CoreArgConverter,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsOverride,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgPath,
	CoreArgPathIndex,
	CoreArgPathReduced,
	CoreArgPathUuidPropertyName,
	Nav,
	coreArgComplexOptionSymbolIndex,
	coreArgConvertContainerArg,
	coreArgGetPathIndex,
	coreArgIdToPathUuidPropertyName,
	navIndex
} from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CellPathExtended,
	CommsCell,
	CommsCellArgs,
	CommsCellRaw,
	CoreCellArg,
	CoreCellArgGrandparentIds,
	CoreCellArgParentId,
	CoreCellArgParentIds,
	CoreCellInstance,
	coreCellArgParentIdSet
} from "./cell";
import { ShardPath, coreShardArgParentIds } from "./shard";
import { CoreUniverse } from "./universe";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClass,
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectInstance,
	generateCoreUniverseObjectContainerMembers,
	generateCoreUniverseObjectMembers
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
// #endregion

// Infer type from `as const` assertion
/* eslint-disable @typescript-eslint/typedef */
/**
 * Grid parent ID.
 */
const coreGridArgParentId = CoreArgIds.Shard as const;

/**
 * Tuple with core grid arg grandparent IDS.
 */
const coreGridArgGrandparentIds = [...coreShardArgParentIds] as const;

/**
 * Tuple with core grid arg parent IDS.
 */
export const coreGridArgParentIds = [...coreShardArgParentIds, coreGridArgParentId] as const;
/* eslint-enable @typescript-eslint/typedef */

/**
 * Unique set with grandparent ID's for core cell arg.
 */
export const coreGridArgGrandparentIdSet: Set<CoreGridArgGrandparentIds> = new Set(coreGridArgGrandparentIds);

/**
 * Unique set with parent ID's for core cell arg.
 */
export const coreGridArgParentIdSet: Set<CoreGridArgParentIds> = new Set(coreGridArgParentIds);

/**
 * Grid parent Id.
 */
export type CoreGridArgParentId = typeof coreGridArgParentId;

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
export type CoreGridArg<Options extends CoreArgOptionsUnion> = CoreArgContainerArg<
	CoreArgIds.Grid,
	Options,
	CoreGridArgParentIds,
	CoreCellArg<Options>,
	CoreArgIds.Cell
> &
	Vector;

/**
 * Core grid.
 */
export type CoreGridInstance<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Cell extends CoreCellInstance<BaseClass, Options, any> = CoreCellInstance<BaseClass, Options>
> = CoreUniverseObjectInstance<
	BaseClass,
	CoreGridArg<Options>,
	CoreArgIds.Grid,
	Options,
	CoreGridArgParentId,
	CoreGridArgGrandparentIds,
	Cell,
	CoreCellArg<Options>,
	CoreArgIds.Cell
> &
	Vector;

/**
 * Core grid class.
 */
export type CoreGridClass<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Cell extends CoreCellInstance<BaseClass, Options, any> = CoreCellInstance<BaseClass, Options>,
	Grid extends CoreGridInstance<BaseClass, Options, Cell> = CoreGridInstance<BaseClass, Options, Cell>
> = CoreUniverseObjectClass<
	BaseClass,
	Grid,
	CoreGridArg<Options>,
	CoreArgIds.Grid,
	Options,
	CoreGridArgParentId,
	CoreGridArgGrandparentIds,
	Cell,
	CoreCellArg<Options>,
	CoreArgIds.Cell,
	<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>(
		...args: Parameters<
			CoreArgConverter<
				CoreGridArg<SourceOptions>,
				CoreGridArg<TargetOptions>,
				CoreArgIds.Grid,
				SourceOptions,
				TargetOptions,
				CoreGridArgParentIds
			>
		>
	) => ReturnType<
		CoreArgConverter<
			CoreGridArg<SourceOptions>,
			CoreGridArg<TargetOptions>,
			CoreArgIds.Grid,
			SourceOptions,
			TargetOptions,
			CoreGridArgParentIds
		>
	>
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
	Cell extends CoreCellInstance<BaseClass, Options>
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
	 * Constructor params.
	 */
	type ConstructorParams = CoreUniverseObjectConstructorParameters<
		BaseClass,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreGridArgParentIds
	>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateMembersParams = [
		{
			/**
			 * Arg path.
			 */
			arg: CoreGridArg<Options>;
		}
	];

	/**
	 * Parameters for generate with child functions.
	 */
	type GenerateMembersWithChildParams = [];

	/**
	 * New class to re-inject.
	 */
	// Intersection preserves constructor parameters of core cell, and instance type of base class
	type ReturnClass = Grid extends CoreGridArg<Options> ? typeof Grid : never;

	/**
	 * Interface merging with grid.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Grid
		extends ComputedClassExtractInstance<typeof membersWithChild, GenerateMembersWithChildParams>,
			ComputedClassExtractInstance<typeof members, GenerateMembersParams> {}

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const membersWithChild = generateCoreUniverseObjectContainerMembers<
		BaseClass,
		Cell,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentId,
		CoreCellArgGrandparentIds
	>({
		id: CoreArgIds.Cell,
		options
	});

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = generateCoreUniverseObjectMembers<
		BaseClass,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreGridArgParentId,
		CoreGridArgGrandparentIds,
		Cell,
		CoreCellArg<Options>,
		CoreArgIds.Cell
	>({
		childId: CoreArgIds.Cell,
		grandparentIds: coreGridArgGrandparentIdSet,
		id: CoreArgIds.Grid,
		options,
		parentId: coreGridArgParentId
	});

	/**
	 * Core grid base class.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class Grid
		// Casting will remove non-static instance information by intersecting with `any`, while maintaining constructor parameters, that will be included into factory return
		extends class extends Base {}
		implements StaticImplements<ToAbstract<CoreGridClass<BaseClass, Options, Cell>>, typeof Grid>
	{
		/**
		 * Default entity.
		 *
		 * @remarks
		 * Redefining.
		 */
		public defaultCell!: Cell;

		/**
		 * Implemented via {@link generateCoreUniverseObjectMembers}.
		 *
		 * @remarks
		 * TS static property declaration is not required right now.
		 */
		public static getDefaultCellUuid: (path: GridPathOwn) => Uuid;

		public x: Vector["x"];

		public y: Vector["y"];

		public z: Vector["z"];

		// ESLint buggy
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 *
		 * @param args - Constructor parameters
		 */
		// ESLint buggy for nested destructured params
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor(...[arg, { attachHook, created }, baseParams]: ConstructorParams) {
			// ESLint false negative, also does not seem to deal well with generics
			// eslint-disable-next-line constructor-super, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			super(baseParams);

			// Vector
			this.x = arg.x;
			this.y = arg.y;
			this.z = arg.z;

			// Create child arg, then attach conditional props
			let defaultCellArg: CoreCellArg<Options> = {
				// Ensures getting uuid from subclass
				cellUuid: (Grid.constructor as typeof Grid).getDefaultCellUuid(this),

				entities: new Map(),

				// Extended path
				...(options[CoreArgOptionIds.Path] ===
				coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
					? Array.from(coreCellArgParentIdSet.values()).reduce((r, i) => {
							let uuidPropertyName: CoreArgPathUuidPropertyName<typeof i> = coreArgIdToPathUuidPropertyName({ id: i });
							return { ...r, [uuidPropertyName]: this[uuidPropertyName] };
					  }, {})
					: {})
			} as CoreCellArg<Options>;

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [],
				instance: this,
				members: membersWithChild,
				parameters: []
			});

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [this, [arg, { attachHook, created }, baseParams], defaultCellArg],
				instance: this,
				members,
				parameters: [{ arg }]
			});
		}

		/**
		 * Convert grid args between options.
		 *
		 * Has to strictly follow {@link CoreGridArg}.
		 *
		 * @remarks
		 * Nav conversion performed here, as nav makes sense only in grid context.
		 * Additional objects are generated when target is nav, or when vector needs to be inferred. It does not need to be done for every case, but it is done here for simplicity.
		 *
		 * @param param - Destructured parameter
		 * @returns Converted grid args
		 */
		public static convertGrid<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>({
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
			/**
			 * Cell with vector.
			 */
			type SourceCellWithVector = CoreCellArg<CoreArgOptionsOverride<SourceOptions, CoreArgOptionIds.Vector>>;

			/**
			 * Cell with vector.
			 */
			type TargetCellWithVector = CoreCellArg<CoreArgOptionsOverride<TargetOptions, CoreArgOptionIds.Vector>>;

			/**
			 * Cell with nav.
			 */
			type SourceCellWithNavMap = CoreCellArg<
				CoreArgOptionsOverride<SourceOptions, CoreArgOptionIds.Nav | CoreArgOptionIds.Map>
			>;

			/**
			 * Cell with nav.
			 */
			type TargetCellWithNavMap = CoreCellArg<
				CoreArgOptionsOverride<TargetOptions, CoreArgOptionIds.Nav | CoreArgOptionIds.Map>
			>;

			/**
			 * Cell with nav.
			 */
			type TargetCellWithNavWithoutMap = CoreCellArg<
				CoreArgOptionsOverride<TargetOptions, CoreArgOptionIds.Nav, CoreArgOptionIds.Map>
			>;

			/**
			 * Helper assigning one nav value.
			 *
			 * @param param - Destructured parameter
			 */
			function assignNav({
				nav,
				targetCell,
				navTarget
			}: {
				/**
				 * Nav.
				 */
				nav: Nav;

				/**
				 * Target cell.
				 */
				targetCell: CoreCellArg<TargetOptions>;

				/**
				 * Target nav value.
				 */
				navTarget: undefined | CoreArgPathReduced<CoreArgIds.Cell, TargetOptions, CoreCellArgParentIds>;
			}): void {
				if (navTarget !== undefined) {
					if (targetOptions[CoreArgOptionIds.Map]) {
						(targetCell as unknown as TargetCellWithNavMap).nav.set(nav, navTarget as unknown as TargetCellWithNavMap);
					} else {
						if ((targetCell as unknown as TargetCellWithNavWithoutMap).nav === undefined) {
							(targetCell as unknown as TargetCellWithNavWithoutMap).nav = {};
						}

						// Initialized above
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						(targetCell as unknown as TargetCellWithNavWithoutMap).nav![nav] =
							navTarget as unknown as TargetCellWithNavWithoutMap;
					}
				}
			}

			let link:
				| CoreArgConvertContainerLink<
						CoreArgIds.Cell,
						SourceOptions,
						TargetOptions,
						CoreCellArgParentIds,
						CoreCellArg<SourceOptions>,
						CoreCellArg<TargetOptions>
				  >
				| undefined =
				targetOptions[CoreArgOptionIds.Nav] ||
				(targetOptions[CoreArgOptionIds.Vector] && !sourceOptions[CoreArgOptionIds.Vector])
					? {
							source: new Map(),
							target: new Map()
					  }
					: undefined;

			// Cannot assign to conditional type without casting
			let targetGrid: CoreGridArg<TargetOptions> = {
				x: grid.x,
				y: grid.y,
				z: grid.z,

				...coreArgConvertContainerArg<
					CoreGridArg<SourceOptions>,
					CoreArgIds.Grid,
					SourceOptions,
					TargetOptions,
					CoreGridArgParentIds,
					CoreCellArg<SourceOptions>,
					CoreCellArg<TargetOptions>,
					CoreArgIds.Cell
				>({
					arg: grid,
					childConverter: (Grid.universe as CoreUniverse<BaseClass, Options>).Cell.convertCell,
					childId: CoreArgIds.Cell,
					id: CoreArgIds.Grid,
					link,
					meta,
					parentIds: coreGridArgParentIdSet,
					sourceOptions,
					targetOptions
				})
			};

			// Work with link
			if (link !== undefined) {
				// 3D Array of targets indexed by vector
				let targetVectorArray: VectorArray<CoreCellArg<TargetOptions>> = new VectorArray<CoreCellArg<TargetOptions>>(
					grid
				);
				if (sourceOptions[CoreArgOptionIds.Vector]) {
					grid.cells.forEach(sourceCell => {
						targetVectorArray.setElement({
							// Does not infer appropriately
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							element: link!.source.get(sourceCell),
							vector: sourceCell as SourceCellWithVector
						});
					});
				} else {
					targetVectorArray.fillWithElements({ elements: Array.from(link.target.keys()) });
				}

				// Nav
				if (targetOptions[CoreArgOptionIds.Nav]) {
					if (sourceOptions[CoreArgOptionIds.Nav]) {
						// Map of source path indexes to source cells
						let sourceReducedPathIndex: Map<CoreArgPathIndex<SourceOptions>, CoreCellArg<SourceOptions>> = new Map();
						grid.cells.forEach(cell => {
							let i: CoreArgPathIndex<SourceOptions> | undefined = coreArgGetPathIndex<
								CoreArgIds.Cell,
								SourceOptions,
								CoreCellArgParentIds
							>({
								id: CoreArgIds.Cell,
								options: sourceOptions,
								path: cell
							});
							if (i !== undefined) {
								sourceReducedPathIndex.set(i, cell);
							}
						});

						// For each target
						link.target.forEach((sourceCell, targetCell) => {
							// For each nav in corresponding cell
							(sourceCell as unknown as SourceCellWithNavMap).nav.forEach((path, nav) => {
								// Path index of source's cell corresponding to nav
								let navSourcePath: CoreArgPathIndex<SourceOptions> | undefined = coreArgGetPathIndex<
									CoreArgIds.Cell,
									SourceOptions,
									CoreCellArgParentIds
								>({
									id: CoreArgIds.Cell,
									options: sourceOptions,
									path: path as CoreCellArg<SourceOptions>
								});

								// Assign target's cell corresponding to nav, into target nav
								if (navSourcePath !== undefined) {
									let navSource: CoreCellArg<SourceOptions> | undefined = sourceReducedPathIndex.get(navSourcePath);
									if (navSource !== undefined) {
										// Does not infer not undefined
										// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
										let navTarget: CoreCellArg<TargetOptions> | undefined = link!.source.get(navSource);
										assignNav({ nav, navTarget, targetCell });
									}
								}
							});
						});
					} else {
						// For each x, y and z
						targetVectorArray.forEach((xIndex, x) => {
							xIndex.forEach((yIndex, y) => {
								yIndex.forEach((targetCell, z) => {
									if (targetCell !== undefined) {
										// For each nav value
										navIndex.forEach((coordChanges, nav) => {
											// Infer target for nav
											let navTarget: CoreCellArg<TargetOptions> | undefined = targetVectorArray.getElement({
												x: x + coordChanges.x,
												y: y + coordChanges.y,
												z: z + coordChanges.z
											});

											// Assign target's cell corresponding to nav, into target nav
											assignNav({ nav, navTarget, targetCell });
										});
									}
								});
							});
						});
					}
				}

				// Vector
				if (targetOptions[CoreArgOptionIds.Vector]) {
					targetVectorArray.forEach((xIndex, x) => {
						xIndex.forEach((yIndex, y) => {
							yIndex.forEach((targetCell, z) => {
								(targetCell as TargetCellWithVector).x = x;
								(targetCell as TargetCellWithVector).y = y;
								(targetCell as TargetCellWithVector).z = z;
							});
						});
					});
				}
			}

			// Return
			return targetGrid;
		}
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Grid,
		members: membersWithChild,
		// Nothing required
		parameters: []
	});

	// Inject static
	computedClassInjectPerClass({
		Base: Grid,
		members,
		// Nothing required
		parameters: []
	});

	// Have to re-inject dynamic bits from generic parents
	return Grid as ReturnClass;
}
