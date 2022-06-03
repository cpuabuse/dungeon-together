/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core universe.
 */

import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { StaticImplements, ToAbstract } from "../common/utility-types";
import { Application } from "./application";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgContainer,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsPathOwnUnion,
	CoreArgOptionsWithMapUnion,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CellPathOwn,
	CoreCellArg,
	CoreCellArgGrandparentIds,
	CoreCellArgParentId,
	CoreCellArgParentIds,
	CoreCellClass,
	CoreCellInstance
} from "./cell";
import {
	CoreEntityArg,
	CoreEntityArgGrandparentIds,
	CoreEntityArgParentId,
	CoreEntityArgParentIds,
	CoreEntityClass,
	CoreEntityInstance,
	EntityPathOwn
} from "./entity";
import {
	CoreGridArg,
	CoreGridArgGrandparentIds,
	CoreGridArgParentId,
	CoreGridArgParentIds,
	CoreGridClass,
	CoreGridInstance,
	GridPathOwn
} from "./grid";
import { CoreArgIndexer } from "./indexable";
import {
	CoreShardArg,
	CoreShardArgGrandparentIds,
	CoreShardArgParentId,
	CoreShardArgParentIds,
	CoreShardClass,
	CoreShardInstance
} from "./shard";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectContainerClass,
	CoreUniverseObjectContainerInstance,
	CoreUniverseObjectUniverse,
	generateCoreUniverseObjectContainerMembers
} from "./universe-object";

/**
 * Classes extending core universe to have the constructor signature.
 */
export interface CoreUniverseParams {
	/**
	 * App with state.
	 */
	application: Application;
}

/**
 * Core universe class.
 *
 * Must remain statically typed, without use of mixins, for appropriate type recursions.
 */
export type CoreUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseClass, Options> = CoreEntityInstance<BaseClass, Options>,
	Cell extends CoreCellInstance<BaseClass, Options, Entity> = CoreCellInstance<BaseClass, Options, Entity>,
	Grid extends CoreGridInstance<BaseClass, Options, Cell> = CoreGridInstance<BaseClass, Options, Cell>,
	Shard extends CoreShardInstance<BaseClass, Options, Grid> = CoreShardInstance<BaseClass, Options, Grid>
> = CoreUniverseObjectContainerInstance<
	BaseClass,
	Shard,
	CoreShardArg<Options>,
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentId,
	CoreShardArgGrandparentIds
> &
	CoreUniverseObjectUniverse<
		BaseClass,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentId,
		CoreEntityArgGrandparentIds
	> &
	CoreUniverseObjectUniverse<
		BaseClass,
		Cell,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentId,
		CoreCellArgGrandparentIds,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity
	> &
	CoreUniverseObjectUniverse<
		BaseClass,
		Grid,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreGridArgParentId,
		CoreGridArgGrandparentIds,
		Cell,
		CoreCellArg<Options>,
		CoreArgIds.Cell
	> &
	CoreUniverseObjectUniverse<
		BaseClass,
		Shard,
		CoreShardArg<Options>,
		CoreArgIds.Shard,
		Options,
		CoreShardArgParentId,
		CoreShardArgGrandparentIds,
		Grid,
		CoreGridArg<Options>,
		CoreArgIds.Grid
	>;

/**
 * Core universe class type.
 */
export type CoreUniverseClass<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseClass, Options> = CoreEntityInstance<BaseClass, Options>,
	Cell extends CoreCellInstance<BaseClass, Options, Entity> = CoreCellInstance<BaseClass, Options, Entity>,
	Grid extends CoreGridInstance<BaseClass, Options, Cell> = CoreGridInstance<BaseClass, Options, Cell>,
	Shard extends CoreShardInstance<BaseClass, Options, Grid> = CoreShardInstance<BaseClass, Options, Grid>
> = CoreUniverseObjectContainerClass<
	BaseClass,
	CoreUniverse<BaseClass, Options, Entity, Cell, Grid, Shard>,
	Shard,
	CoreShardArg<Options>,
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentId,
	CoreShardArgGrandparentIds
>;

/**
 * Generates core universe class.
 *
 * @param param - Destructured parameters
 * @returns Core universe class
 */
// Have to infer type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseClass, Options> = CoreEntityInstance<BaseClass, Options>,
	Cell extends CoreCellInstance<BaseClass, Options, Entity> = CoreCellInstance<BaseClass, Options, Entity>,
	Grid extends CoreGridInstance<BaseClass, Options, Cell> = CoreGridInstance<BaseClass, Options, Cell>,
	Shard extends CoreShardInstance<BaseClass, Options, Grid> = CoreShardInstance<BaseClass, Options, Grid>
>({
	Base,
	options
}: {
	/**
	 * Base class.
	 */
	Base: BaseClass;

	/**
	 * Options.
	 */
	options: Options;
}) {
	/**
	 * Ids.
	 */
	type Ids = typeof ids[number];

	/**
	 * Generate parameters for as shard container.
	 */
	type GenerateMembersWithChildParams = [];

	/**
	 * Interface merging with grid.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Universe extends ComputedClassExtractInstance<typeof membersWithChild, GenerateMembersWithChildParams> {}

	// eslint-disable-next-line @typescript-eslint/typedef
	const ids = [CoreArgIds.Entity, CoreArgIds.Cell, CoreArgIds.Grid] as const;

	const isOwnPath: boolean =
		options[CoreArgOptionIds.Path] ===
		coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own];

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const membersWithChild = generateCoreUniverseObjectContainerMembers<
		BaseClass,
		Shard,
		CoreShardArg<Options>,
		CoreArgIds.Shard,
		Options,
		CoreShardArgParentId,
		CoreShardArgGrandparentIds
	>({
		id: CoreArgIds.Shard,
		options
	});

	/**
	 * Core universe class.
	 *
	 * Must remain statically typed, without use of mixins, for appropriate type recursions.
	 */
	// Interface merging
	// eslint-disable-next-line no-redeclare
	abstract class Universe
		implements
			StaticImplements<ToAbstract<CoreUniverseClass<BaseClass, Options, Entity, Cell, Grid, Shard>>, typeof Universe>
	{
		public abstract Cell: CoreCellClass<BaseClass, Options, Entity, Cell>;

		public abstract Entity: CoreEntityClass<BaseClass, Options, Entity>;

		public abstract Grid: CoreGridClass<BaseClass, Options, Cell, Grid>;

		public abstract Shard: CoreShardClass<BaseClass, Options, Grid, Shard>;

		/**
		 * Application.
		 */
		public application: Application;

		public attachCell!: Options extends CoreArgOptionsPathOwnUnion ? (cell: Cell) => void : never;

		public attachEntity!: Options extends CoreArgOptionsPathOwnUnion ? (entity: Entity) => void : never;

		public attachGrid!: Options extends CoreArgOptionsPathOwnUnion ? (grid: Grid) => void : never;

		/**
		 * Grids.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		public cells!: Options extends CoreArgOptionsPathOwnUnion
			? CoreArgIndexer<Cell, CoreArgIds.Cell, Options, CoreCellArgParentIds>["cells"]
			: never;

		public defaultCell!: Options extends CoreArgOptionsPathOwnUnion ? Cell : never;

		public defaultEntity!: Options extends CoreArgOptionsPathOwnUnion ? Entity : never;

		public defaultGrid!: Options extends CoreArgOptionsPathOwnUnion ? Grid : never;

		/**
		 * Default shard.
		 */
		public abstract defaultShard: Shard;

		public detachCell!: Options extends CoreArgOptionsPathOwnUnion ? (path: CellPathOwn) => void : never;

		public detachEntity!: Options extends CoreArgOptionsPathOwnUnion ? (path: EntityPathOwn) => void : never;

		public detachGrid!: Options extends CoreArgOptionsPathOwnUnion ? (path: GridPathOwn) => void : never;

		/**
		 * Grids.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		public entities!: Options extends CoreArgOptionsPathOwnUnion
			? CoreArgIndexer<Entity, CoreArgIds.Entity, Options, CoreEntityArgParentIds>["entities"]
			: never;

		/**
		 * Get cell.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		public getCell!: (path: CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>) => Cell;

		public getEntity!: (path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>) => Entity;

		public getGrid!: (path: CoreArgPath<CoreArgIds.Grid, Options, CoreGridArgParentIds>) => Grid;

		/**
		 * Grids.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		public grids!: Options extends CoreArgOptionsPathOwnUnion
			? CoreArgIndexer<Grid, CoreArgIds.Grid, Options, CoreGridArgParentIds>["grids"]
			: never;

		/**
		 * Constructs the universe core.
		 *
		 * @param param - Destructured parameters
		 */
		public constructor({ application }: CoreUniverseParams) {
			this.application = application;

			// Own path specific
			if (
				options[CoreArgOptionIds.Path] ===
				coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
			) {
				(this as CoreArgContainer<Grid, CoreArgIds.Grid, CoreArgOptionsWithMapUnion, CoreGridArgParentIds>).grids =
					new Map();
				(this as CoreArgContainer<Cell, CoreArgIds.Cell, CoreArgOptionsWithMapUnion, CoreCellArgParentIds>).cells =
					new Map();
				(
					this as CoreArgContainer<Entity, CoreArgIds.Entity, CoreArgOptionsWithMapUnion, CoreEntityArgParentIds>
				).entities = new Map();

				Object.defineProperties(this, {
					defaultCell: {
						/**
						 * Get cell.
						 *
						 * @param this - Universe
						 * @returns Cell
						 */
						get(this: Universe): Cell {
							return this.defaultShard.defaultGrid.defaultCell;
						}
					},
					defaultEntity: {
						/**
						 * Get entity.
						 *
						 * @param this - Universe
						 * @returns Entity
						 */
						get(this: Universe): Entity {
							return this.defaultShard.defaultGrid.defaultCell.defaultEntity;
						}
					},
					defaultGrid: {
						/**
						 * Get grid.
						 *
						 * @param this - Universe
						 * @returns Grid
						 */
						get(this: Universe): Grid {
							return this.defaultShard.defaultGrid;
						}
					}
				});
			}

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [],
				instance: this,
				members: membersWithChild,
				parameters: []
			});
		}

		public abstract addShard(
			shardArgs: CoreUniverseObjectConstructorParameters<
				BaseClass,
				CoreShardArg<Options>,
				CoreArgIds.Shard,
				Options,
				CoreShardArgParentIds
			>
		): Shard;
	}

	/**
	 * Generate get function.
	 *
	 * @param param - Destructured parameter
	 * @returns Get function
	 */
	function generateGetUniverseObject<
		Arg extends CoreArg<Id, Options, ParentIds>,
		Id extends Ids,
		ParentIds extends CoreArgIds
	>({
		id
	}: {
		/**
		 * Id.
		 */
		id: Id;
	}): (path: CoreArgPath<Id, Options & CoreArgOptionsPathOwn, ParentIds>) => Arg {
		// Base words
		const {
			pluralLowercaseWord,
			singularCapitalizedWord
		}: {
			/**
			 * The plural lowercase word for the universe object.
			 */
			pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];

			/**
			 * The singular capitalized word for the universe object.
			 */
			singularCapitalizedWord: CoreArgObjectWords[Id]["singularCapitalizedWord"];
		} = coreArgObjectWords[id];

		// Need to extract types
		/* eslint-disable @typescript-eslint/typedef */
		const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
		const nameDefaultUniverseObject = `default${singularCapitalizedWord}` as const; // Name of default universe object
		/* eslint-enable @typescript-eslint/typedef */
		const pathUuidPropertyName: CoreArgPathUuidPropertyName<Id> = coreArgIdToPathUuidPropertyName({
			id
		}); // UUID property name within a path

		// Important to not be arrow function, to get class context
		return function (
			this: CoreArgIndexer<Arg, Id, Options & CoreArgOptionsPathOwn, ParentIds>,
			path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>
		): Arg {
			let arg: Arg | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);

			return arg ?? this[nameDefaultUniverseObject];
		};
	}

	/**
	 * Generates attach function.
	 *
	 * @param param - Destructured parameter
	 * @returns Attach function
	 */
	function generateAttachUniverseObject<
		Arg extends CoreArg<Id, Options, ParentIds>,
		Id extends Ids,
		ParentIds extends CoreArgIds
	>({
		id
	}: {
		/**
		 * Id.
		 */
		id: Id;
	}): (arg: Arg) => void {
		// Base words
		const {
			pluralLowercaseWord
		}: {
			/**
			 * The plural lowercase word for the universe object.
			 */
			pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];
		} = coreArgObjectWords[id];

		// Need to extract types
		/* eslint-disable @typescript-eslint/typedef */
		const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
		/* eslint-enable @typescript-eslint/typedef */
		const pathUuidPropertyName: CoreArgPathUuidPropertyName<Id> = coreArgIdToPathUuidPropertyName({
			id
		}); // UUID property name within a path

		return function (this: CoreArgIndexer<Arg, Id, Options & CoreArgOptionsPathOwn, ParentIds>, arg: Arg): void {
			this[nameUniverseObjects].set(arg[pathUuidPropertyName], arg);
		};
	}

	/**
	 * Generates attach function.
	 *
	 * @param param - Destructured parameter
	 * @returns Attach function
	 */
	function generateDetachUniverseObject<
		Arg extends CoreArg<Id, Options, ParentIds>,
		Id extends Ids,
		ParentIds extends CoreArgIds
	>({
		id
	}: {
		/**
		 * Id.
		 */
		id: Id;
	}): (path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>) => void {
		// Base words
		const {
			pluralLowercaseWord
		}: {
			/**
			 * The plural lowercase word for the universe object.
			 */
			pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];
		} = coreArgObjectWords[id];

		// Need to extract types
		/* eslint-disable @typescript-eslint/typedef */
		const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
		/* eslint-enable @typescript-eslint/typedef */
		const pathUuidPropertyName: CoreArgPathUuidPropertyName<Id> = coreArgIdToPathUuidPropertyName({
			id
		}); // UUID property name within a path

		return function (
			this: CoreArgIndexer<Arg, Id, Options & CoreArgOptionsPathOwn, ParentIds>,
			path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>
		): void {
			this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
		};
	}

	// Assume extended otherwise
	if (isOwnPath) {
		// Get
		(Universe.prototype as Universe).getGrid = generateGetUniverseObject<Grid, CoreArgIds.Grid, CoreGridArgParentIds>({
			id: CoreArgIds.Grid
		});
		(Universe.prototype as Universe).getCell = generateGetUniverseObject<Cell, CoreArgIds.Cell, CoreCellArgParentIds>({
			id: CoreArgIds.Cell
		});
		(Universe.prototype as Universe).getEntity = generateGetUniverseObject<
			Entity,
			CoreArgIds.Entity,
			CoreEntityArgParentIds
		>({
			id: CoreArgIds.Entity
		});

		// Attach
		Universe.prototype.attachGrid = generateAttachUniverseObject<Grid, CoreArgIds.Grid, CoreGridArgParentIds>({
			id: CoreArgIds.Grid
		});
		Universe.prototype.attachCell = generateAttachUniverseObject<Cell, CoreArgIds.Cell, CoreCellArgParentIds>({
			id: CoreArgIds.Cell
		});
		Universe.prototype.attachEntity = generateAttachUniverseObject<Entity, CoreArgIds.Entity, CoreEntityArgParentIds>({
			id: CoreArgIds.Entity
		});

		// Detach
		Universe.prototype.detachGrid = generateDetachUniverseObject<Grid, CoreArgIds.Grid, CoreGridArgParentIds>({
			id: CoreArgIds.Grid
		});
		Universe.prototype.detachCell = generateDetachUniverseObject<Cell, CoreArgIds.Cell, CoreCellArgParentIds>({
			id: CoreArgIds.Cell
		});
		Universe.prototype.detachEntity = generateDetachUniverseObject<Entity, CoreArgIds.Entity, CoreEntityArgParentIds>({
			id: CoreArgIds.Entity
		});
	} else {
		/**
		 * Get grid.
		 *
		 * @param this - Universe
		 * @param path - Path
		 * @returns Grid
		 */
		(Universe.prototype as Universe).getGrid = function (
			this: Universe,
			path: CoreArgPath<CoreArgIds.Grid, CoreArgOptionsPathExtended, CoreGridArgParentIds>
		): Grid {
			// Cast to match paths
			return this.getShard(path).getGrid(path);
			// Reverting path argument
		} as (path: CoreArgPath<CoreArgIds.Grid, Options, CoreGridArgParentIds>) => Grid;

		/**
		 * Get cell.
		 *
		 * @param this - Universe
		 * @param path - Path
		 * @returns Cell
		 */
		(Universe.prototype as Universe).getCell = function (
			this: Universe,
			path: CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathExtended, CoreCellArgParentIds>
		): Cell {
			// Cast to match paths
			return this.getShard(path).getGrid(path).getCell(path);
			// Reverting path argument
		} as (path: CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>) => Cell;

		/**
		 * Get entity.
		 *
		 * @param this - Universe
		 * @param path - Path
		 * @returns Entity
		 */
		(Universe.prototype as Universe).getEntity = function (
			this: Universe,
			path: CoreArgPath<CoreArgIds.Entity, CoreArgOptionsPathExtended, CoreEntityArgParentIds>
		): Entity {
			// Cast to match paths
			return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
			// Reverting path argument
		} as (path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>) => Entity;
	}

	// Inject static
	computedClassInjectPerClass({
		Base,
		members: membersWithChild,
		// Nothing required
		parameters: []
	});

	return Universe;
}
