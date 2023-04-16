/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core universe.
 */

import { SequenceQueue } from "../common/async/promise-queue";
import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { UrlPath } from "../common/url";
import { ConcreteConstructor, StaticImplements, ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { Application } from "./application";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgContainer,
	CoreArgIds,
	CoreArgIndex,
	CoreArgIndexIds,
	CoreArgIndexObject,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsPathOwnUnion,
	CoreArgOptionsUnion,
	CoreArgOptionsWithMapUnion,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords,
	getCoreArgIndexObjectPropertyName
} from "./arg";
import { coreArgGenerateDefaultUuid } from "./arg/uuid";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveParameters } from "./base";
import { CellPathOwn, CoreCellArg, CoreCellClass, CoreCellInstance } from "./cell";
import { CoreConnection, CorePlayerContainer } from "./connection";
import { CoreEntityArg, CoreEntityClass, CoreEntityInstance, EntityPathOwn } from "./entity";
import { CoreLog, LogLevel } from "./error";
import { CoreGridArg, CoreGridClass, CoreGridInstance, GridPathOwn } from "./grid";
import { CoreArgIndexer } from "./indexable";
import {
	CoreCellArgGrandparentIds,
	CoreCellArgParentId,
	CoreCellArgParentIds,
	CoreEntityArgGrandparentIds,
	CoreEntityArgParentId,
	CoreEntityArgParentIds,
	CoreGridArgGrandparentIds,
	CoreGridArgParentId,
	CoreGridArgParentIds,
	CoreShardArgGrandparentIds,
	CoreShardArgParentId,
	CoreShardArgParentIds
} from "./parents";
import { CoreShardArg, CoreShardClass, CoreShardInstance } from "./shard";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectContainerClass,
	CoreUniverseObjectUniverse,
	generateCoreUniverseObjectContainerMembers
} from "./universe-object";

/**
 * Unique universe identifier.
 */
// eslint-disable-next-line @typescript-eslint/typedef
export const universeNamespace = "universe" as const;

/**
 * Unique universe identifier.
 */
export type UniverseNamespace = typeof universeNamespace;

/**
 * First parameter for concrete universe.
 *
 * To be extended and used as argument in concrete universe.
 */
export type CoreUniverseRequiredConstructorParameter = {
	/**
	 * App with state.
	 */
	application: Application;

	/**
	 * Universe UUID.
	 */
	universeUuid: Uuid;
};

/**
 * Definition of parameters for concrete universe.
 */
export type CoreUniverseConstructorParams<R extends any[] = any[]> = [CoreUniverseRequiredConstructorParameter, ...R];

/**
 * Placeholder for the universe, to use for generic constraints.
 *
 * @see {@link CoreBaseClassNonRecursive}
 */
export type CoreUniverseInstanceNonRecursive = object;

/**
 * Part to be implemented by core universe.
 */
type CoreUniverseInstanceNonRecursiveCoreImplements = CoreUniverseInstanceNonRecursive & CoreLog;

/**
 * Placeholder for the universe, to cast when base or options are not known. To be implemented when concrete.
 */
export type CoreUniverseInstanceNonRecursiveCast<Connection extends CoreConnection = CoreConnection> =
	CoreUniverseInstanceNonRecursiveCoreImplements & CoreInstanceNonRecursiveImplements<Connection>;

/**
 * To be implemented when concrete, to make sure cast is correct.
 */
export type CoreInstanceNonRecursiveImplements<Connection extends CoreConnection = CoreConnection> = {
	/**
	 * Connections.
	 */
	connections: Map<Uuid, Connection>;

	/**
	 * Shards containing player container.
	 */
	shards: Map<
		Uuid,
		Connection extends CoreConnection<any, any, any, infer Player> ? CorePlayerContainer<Player> : never
	>;
};

/**
 * Placeholder for the universe.
 *
 * @see {@link CoreBaseClassNonRecursive}
 */
export type CoreUniverseClassNonRecursive<
	Universe extends CoreUniverseInstanceNonRecursive = CoreUniverseInstanceNonRecursive,
	R extends any[] = any[]
> = ConcreteConstructor<CoreUniverseConstructorParams<R>, Universe>;

/**
 * Core universe class.
 *
 * Must remain statically typed, without use of mixins, for appropriate type recursions.
 */
export type CoreUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options> = CoreEntityInstance<BaseParams, Options>,
	Cell extends CoreCellInstance<BaseParams, Options, Entity> = CoreCellInstance<BaseParams, Options, Entity>,
	Grid extends CoreGridInstance<BaseParams, Options, Cell> = CoreGridInstance<BaseParams, Options, Cell>,
	Shard extends CoreShardInstance<BaseParams, Options, Grid> = CoreShardInstance<BaseParams, Options, Grid>
> = CoreUniverseInstanceNonRecursiveCoreImplements & {
	/**
	 * Base class.
	 */
	Base: BaseClass;
} & CoreUniverseObjectUniverse<
		BaseParams,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentId,
		CoreEntityArgGrandparentIds
	> &
	CoreUniverseObjectUniverse<
		BaseParams,
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
		BaseParams,
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
		BaseParams,
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
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options> = CoreEntityInstance<BaseParams, Options>,
	Cell extends CoreCellInstance<BaseParams, Options, Entity> = CoreCellInstance<BaseParams, Options, Entity>,
	Grid extends CoreGridInstance<BaseParams, Options, Cell> = CoreGridInstance<BaseParams, Options, Cell>,
	Shard extends CoreShardInstance<BaseParams, Options, Grid> = CoreShardInstance<BaseParams, Options, Grid>,
	Universe extends CoreUniverse<BaseClass, BaseParams, Options, Entity, Cell, Grid, Shard> = CoreUniverse<
		BaseClass,
		BaseParams,
		Options,
		Entity,
		Cell,
		Grid,
		Shard
	>
> = {
	/**
	 * Converts ID to UUID.
	 */
	convertIdToUuid({
		id,
		namespace
	}: {
		/**
		 * Id.
		 */
		id: string;

		/**
		 * Namespace.
		 */
		namespace?: UrlPath;
	}): Uuid;

	/**
	 * Convert index.
	 */
	convertIndex<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>({
		idx,
		sourceOptions,
		targetOptions,
		namespace
	}: {
		/**
		 * Object.
		 */
		idx: CoreArgIndex<SourceOptions>;

		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Target options.
		 */
		targetOptions: TargetOptions;

		/**
		 * Namespace.
		 */
		namespace?: UrlPath;
	}): CoreArgIndex<TargetOptions>;

	/**
	 * Converts index object.
	 */
	convertIndexObject<
		Property extends CoreArgIndexIds,
		SourceOptions extends CoreArgOptionsUnion,
		TargetOptions extends CoreArgOptionsUnion
	>({
		obj,
		name,
		sourceOptions,
		targetOptions,
		namespace
	}: {
		/**
		 * Object.
		 */
		obj: CoreArgIndexObject<Property, SourceOptions>;

		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Property name.
		 */
		name: Property;

		/**
		 * Target options.
		 */
		targetOptions: TargetOptions;

		/**
		 * Namespace.
		 */
		namespace?: UrlPath;
	}): CoreArgIndexObject<Property, TargetOptions>;

	/**
	 * Converts UUID to ID.
	 */
	convertUuidToId({
		uuid
	}: {
		/**
		 * UUID.
		 */
		uuid: Uuid;
	}): string;

	/**
	 * Converts index object to path.
	 */
	convertIndexObjectToPath<Property extends CoreArgIndexIds, O extends CoreArgOptionsUnion>({
		obj,
		name,
		options
	}: {
		/**
		 * Object.
		 */
		obj: CoreArgIndexObject<Property, O>;

		/**
		 * Source options.
		 */
		options: O;

		/**
		 * Property name.
		 */
		name: Property;
	}): UrlPath;
} & CoreUniverseObjectContainerClass<
	BaseParams,
	Universe,
	Shard,
	CoreShardArg<Options>,
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentId,
	CoreShardArgGrandparentIds,
	CoreUniverseConstructorParams
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
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options> = CoreEntityInstance<BaseParams, Options>,
	Cell extends CoreCellInstance<BaseParams, Options, Entity> = CoreCellInstance<BaseParams, Options, Entity>,
	Grid extends CoreGridInstance<BaseParams, Options, Cell> = CoreGridInstance<BaseParams, Options, Cell>,
	Shard extends CoreShardInstance<BaseParams, Options, Grid> = CoreShardInstance<BaseParams, Options, Grid>
>({
	options,
	logSource
}: {
	/**
	 * Options.
	 */
	options: Options;

	/**
	 * Log source name.
	 */
	logSource: string;
}) {
	/**
	 * Shard path.
	 */
	type ShardPath = CoreArgPath<CoreArgIds.Shard, Options, CoreShardArgParentIds>;

	/**
	 * Grid path.
	 */
	type GridPath = CoreArgPath<CoreArgIds.Grid, Options, CoreGridArgParentIds>;

	/**
	 * Cell path.
	 */
	type CellPath = CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>;

	/**
	 * Entity path.
	 */
	type EntityPath = CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>;

	/**
	 * Ids.
	 */
	type Ids = (typeof ids)[number];

	/**
	 * Generate parameters for as shard container.
	 */
	type GenerateMembersWithChildParams = [];

	/**
	 * Interface merging with grid.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Universe extends ComputedClassExtractInstance<typeof membersWithChild, GenerateMembersWithChildParams> {
		/**
		 * Attach cell.
		 */
		attachCell: Options extends CoreArgOptionsPathOwnUnion ? (cell: Cell) => void : never;

		/**
		 * Attach entity.
		 */
		attachEntity: Options extends CoreArgOptionsPathOwnUnion ? (entity: Entity) => void : never;

		/**
		 * Attach grid.
		 */
		attachGrid: Options extends CoreArgOptionsPathOwnUnion ? (grid: Grid) => void : never;

		/**
		 * Get cell.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		getCell: (path: CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>) => Cell;

		/**
		 * Get entity.
		 */
		getEntity: (path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>) => Entity;

		/**
		 * Get grid.
		 */
		getGrid: (path: CoreArgPath<CoreArgIds.Grid, Options, CoreGridArgParentIds>) => Grid;

		/**
		 * Detach cell.
		 */
		detachCell: Options extends CoreArgOptionsPathOwnUnion ? (path: CellPathOwn) => void : never;

		/**
		 * Detach entity.
		 */
		detachEntity: Options extends CoreArgOptionsPathOwnUnion ? (path: EntityPathOwn) => void : never;

		/**
		 * Detach grid.
		 */
		detachGrid: Options extends CoreArgOptionsPathOwnUnion ? (path: GridPathOwn) => void : never;
	}

	// eslint-disable-next-line @typescript-eslint/typedef
	const ids = [CoreArgIds.Entity, CoreArgIds.Cell, CoreArgIds.Grid] as const;

	const isOwnPath: boolean =
		options[CoreArgOptionIds.Path] ===
		coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own];

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const membersWithChild = generateCoreUniverseObjectContainerMembers<
		BaseParams,
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
		extends CoreLog
		implements
			StaticImplements<
				ToAbstract<CoreUniverseClass<BaseClass, BaseParams, Options, Entity, Cell, Grid, Shard>>,
				typeof Universe
			>
	{
		public abstract Base: BaseClass;

		public abstract Cell: CoreCellClass<BaseParams, Options, Entity, Cell>;

		public abstract Entity: CoreEntityClass<BaseParams, Options, Entity>;

		public abstract Grid: CoreGridClass<BaseParams, Options, Cell, Grid>;

		public abstract Shard: CoreShardClass<BaseParams, Options, Grid, Shard>;

		/**
		 * Application.
		 */
		public application: Application;

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
		 * Grids.
		 *
		 * @remarks
		 * Definitively assigned in constructor.
		 */
		public grids!: Options extends CoreArgOptionsPathOwnUnion
			? CoreArgIndexer<Grid, CoreArgIds.Grid, Options, CoreGridArgParentIds>["grids"]
			: never;

		/**
		 * Queue for universe.
		 */
		public readonly universeQueue: SequenceQueue = new SequenceQueue();

		/**
		 * Universe UUID.
		 */
		public universeUuid: Uuid;

		/**
		 * Constructs the universe core.
		 *
		 * @remarks
		 * Base depends on `this`, so it and it's dependents cannot be passed as arguments to this constructor, as it should be called first in sub-class.
		 *
		 * @param param - Destructured parameters
		 * @param baseParams - Base parameters for default shard
		 */
		public constructor({ application, universeUuid }: CoreUniverseRequiredConstructorParameter) {
			super({ source: logSource, timer: application.state });

			// Universe UUID
			this.universeUuid = universeUuid;

			// Application
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

		/**
		 * Converts ID to UUID.
		 *
		 * @param param - Destructured parameter
		 * @returns UUID
		 */
		public static convertIdToUuid({
			id,
			namespace = "system/default"
		}: {
			/**
			 * Id.
			 */
			id: string;

			/**
			 * Namespace.
			 */
			namespace?: UrlPath;
		}): Uuid {
			// TODO: Replace with correct function
			return `${namespace}/${id}`;
		}

		/**
		 * Converts index.
		 *
		 * @param param - Destructured parameter
		 * @returns Index object
		 */
		public static convertIndex<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>({
			idx,
			sourceOptions,
			targetOptions,
			namespace
		}: {
			/**
			 * Object.
			 */
			idx: CoreArgIndex<SourceOptions>;

			/**
			 * Source options.
			 */
			sourceOptions: SourceOptions;

			/**
			 * Target options.
			 */
			targetOptions: TargetOptions;

			/**
			 * Namespace.
			 */
			namespace?: UrlPath;
		}): CoreArgIndex<TargetOptions> {
			if (
				sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
			) {
				// Id to Id
				if (
					targetOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
				) {
					// Cast, source and target path options are the same
					return idx as CoreArgIndex<TargetOptions>;
				}
				// Id to Uuid
				return this.convertIdToUuid({
					id: idx as string,
					namespace
				}) as CoreArgIndex<TargetOptions>;
			}
			if (
				targetOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
			) {
				// Uuid to Id
				return this.convertUuidToId({
					uuid: idx as unknown as Uuid
				}) as CoreArgIndex<TargetOptions>;
			}
			// Uuid to uuid
			// Cast, source and target path options are the same
			return idx as CoreArgIndex<TargetOptions>;
		}

		/**
		 * Converts index object.
		 *
		 * @param param - Destructured parameter
		 * @returns Index object
		 */
		public static convertIndexObject<
			Property extends CoreArgIndexIds,
			SourceOptions extends CoreArgOptionsUnion,
			TargetOptions extends CoreArgOptionsUnion
		>({
			obj,
			name,
			sourceOptions,
			targetOptions,
			namespace
		}: {
			/**
			 * Object.
			 */
			obj: CoreArgIndexObject<Property, SourceOptions>;

			/**
			 * Source options.
			 */
			sourceOptions: SourceOptions;

			/**
			 * Property name.
			 */
			name: Property;

			/**
			 * Target options.
			 */
			targetOptions: TargetOptions;

			/**
			 * Namespace.
			 */
			namespace?: UrlPath;
		}): CoreArgIndexObject<Property, TargetOptions> {
			let sourceValue: CoreArgIndex<SourceOptions> | undefined = obj[
				getCoreArgIndexObjectPropertyName({
					name,
					options: sourceOptions
				})
				// Conditional generic needs cast
			] as unknown as CoreArgIndex<SourceOptions> | undefined;

			return {
				[getCoreArgIndexObjectPropertyName({ name, options: targetOptions })]: this.convertIndex({
					idx: sourceValue ?? "default",
					namespace,
					sourceOptions,
					targetOptions
				})
				// Cast, since generic key
			} as CoreArgIndexObject<Property, TargetOptions>;
		}

		/**
		 * Converts index object to path.
		 *
		 * @param param - Destructured parameter
		 * @returns Path
		 */
		public static convertIndexObjectToPath<Property extends CoreArgIndexIds, O extends CoreArgOptionsUnion>({
			obj,
			name,
			options: opts
		}: {
			/**
			 * Object.
			 */
			obj: CoreArgIndexObject<Property, O>;

			/**
			 * Source options.
			 */
			options: O;

			/**
			 * Property name.
			 */
			name: Property;
		}): UrlPath {
			return (obj[getCoreArgIndexObjectPropertyName({ name, options: opts })] ?? "default") as unknown as UrlPath;
		}

		/**
		 * Converts UUID to ID.
		 *
		 * @param param - Destructured parameter
		 * @returns ID
		 */
		public static convertUuidToId({
			uuid
		}: {
			/**
			 * UUID.
			 */
			uuid: Uuid;
		}): string {
			return uuid;
		}

		/**
		 * Adds shard (Core level).
		 *
		 * @remarks
		 * Exists to appropriately verbally implement super.
		 */
		public addShard(
			...shardArgs: CoreUniverseObjectConstructorParameters<
				BaseParams,
				CoreShardArg<Options>,
				CoreArgIds.Shard,
				Options,
				CoreShardArgParentIds
			>
		): Shard;

		/**
		 * Adds shard (Pass through extra shard parameters).
		 *
		 * @remarks
		 * If this overload doesn't exist, subclass doesn't pick up that argument depending on `this` is a tuple, when calling superclass, similarly to calling superclass in {@link CoreUniverse.addShard} implementation.
		 */
		public addShard(...shardArgs: ConstructorParameters<this["Shard"]>): Shard;

		/**
		 * Adds shard.
		 *
		 * @remarks
		 * Has an overload to be able to call shard constructor with extra optional parameters.
		 *
		 * Casting is required(this problem is solved for subclasses, but cannot be solved for this class similarly, due it's types coming from dynamically generated classes) when calling superclass with argument depending on `this`, perhaps due to generics(generics might be producing unions) or unions:
		 * - https://github.com/microsoft/TypeScript/issues/49700
		 * - https://github.com/microsoft/TypeScript/issues/49802
		 *
		 * @param this - Universe
		 * @param  shardArgs - Arguments for shard constructor
		 * @returns Resulting shard
		 */
		public addShard(...shardArgs: ConstructorParameters<this["Shard"]>): Shard {
			let shard: Shard;
			// ESLint buggy for nested destructured params
			// eslint-disable-next-line @typescript-eslint/typedef
			let [, { attachHook }]: CoreUniverseObjectConstructorParameters<
				BaseParams,
				CoreShardArg<Options>,
				CoreArgIds.Shard,
				Options,
				CoreShardArgParentIds
			> = shardArgs;

			// Attach hook, delayed to replicate behavior of attach for other universe objects, when path is own
			attachHook
				.then(() => {
					this.attachShard(shard);
				})
				.catch(error => {
					this.log({
						error: new Error(
							`Error ocurred during shard attachment in universe(universeUuid="${this.universeUuid}").`,
							{
								cause: error instanceof Error ? error : undefined
							}
						),
						level: LogLevel.Error
					});
				});

			// Create shard
			shard = new this.Shard(
				...(shardArgs as CoreUniverseObjectConstructorParameters<
					BaseParams,
					CoreShardArg<Options>,
					CoreArgIds.Shard,
					Options,
					CoreShardArgParentIds
				>)
			);

			// Return
			return shard;
		}

		/**
		 * Attaches shard.
		 *
		 * @param shard - Shard
		 */
		public attachShard(shard: Shard): void {
			this.shards.set(shard.shardUuid, shard);
		}

		/**
		 * Gets default shard UUID.
		 *
		 * @returns Shard UUID
		 */
		// To be potentially overridden
		// eslint-disable-next-line class-methods-use-this
		public getDefaultShardUuid(): Uuid {
			return coreArgGenerateDefaultUuid({
				id: CoreArgIds.Shard,
				universeUuid: this.universeUuid,
				// For now, default shard uuid is based on universe uuid
				uuid: this.universeUuid
			});
		}
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
		return function (this: Universe, path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>): Arg {
			let arg: Arg | undefined = // Universe is ID-determined, need casting for generic ID
				(this as unknown as CoreArgIndexer<Arg, Id, Options & CoreArgOptionsPathOwn, ParentIds>)[
					nameUniverseObjects
				].get(path[pathUuidPropertyName]);

			// #if _DEBUG_ENABLED
			// For testing
			// eslint-disable-next-line no-console
			if (!arg) {
				this.log({
					level: LogLevel.Debug,
					message: `Could not find universe object(${pathUuidPropertyName}=${path[pathUuidPropertyName]}).`
				});
			}
			// #endif

			return (
				arg ??
				// Universe is ID-determined, need casting for generic ID
				(this as unknown as CoreArgIndexer<Arg, Id, Options & CoreArgOptionsPathOwn, ParentIds>)[
					nameDefaultUniverseObject
				]
			);
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
			return this.getShard(path as ShardPath).getGrid(path as GridPath);
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
			return this.getShard(path as ShardPath)
				.getGrid(path as GridPath)
				.getCell(path as CellPath);
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
			return this.getShard(path as ShardPath)
				.getGrid(path as GridPath)
				.getCell(path as CellPath)
				.getEntity(path as EntityPath);
			// Reverting path argument
		} as (path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>) => Entity;
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Universe,
		members: membersWithChild,
		// Nothing required
		parameters: []
	});

	return Universe;
}
