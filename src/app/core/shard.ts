/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Comms shard definition
 */

/**
 * Shard.
 */

import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { StaticImplements, ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import {
	CoreArgComplexOptionPathIds,
	CoreArgContainerArg,
	CoreArgConverter,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgConvertContainerArg,
	coreArgIdToPathUuidPropertyName
} from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CommsGrid,
	CommsGridArgs,
	CommsGridRaw,
	CoreGridArg,
	CoreGridArgGrandparentIds,
	CoreGridArgParentId,
	CoreGridInstance,
	GridPathOwn,
	coreGridArgParentIdSet
} from "./grid";
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
 * Everything-like.
 */
export interface CommsShardArgs extends ShardPath {
	/**
	 * Locations.
	 */
	grids: Map<Uuid, CommsGridArgs>;
}

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsShardRaw = Omit<CommsShardArgs, "grids"> & {
	/**
	 * Legacy.
	 */
	grids: Array<CommsGridRaw>;
};

/**
 * Interface as basis for class implementation.
 */
export interface CommsShard extends CommsShardArgs {
	/**
	 * Default [[Grid]] UUID.
	 */
	defaultGridUuid: Uuid;

	/**
	 * Adds [[CommsGrid]].
	 */
	addGrid(grid: CommsGridArgs): void;

	/**
	 * Gets [[CommsGrid]].
	 */
	getGrid(path: GridPathOwn): CommsGrid;

	/**
	 * Removes [[CommsGrid]].
	 */
	removeGrid(path: GridPathOwn): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Core shard args.
 */
export type CoreShardArgs<Options extends CoreArgOptionsUnion> = (Options[CoreArgOptionIds.Path] extends true
	? ShardPathExtended
	: ShardPathOwn) & {
	/**
	 * Grids.
	 */
	grids: Options[CoreArgOptionIds.Map] extends true ? Map<Uuid, CoreGridArg<Options>> : Array<CoreGridArg<Options>>;
};

/**
 * Way to get to shard.
 */
export type ShardPath = ShardPathOwn;
// #endregion

/**
 * Parent ID of {@link CoreShardArg}.
 */
export type CoreShardArgParentId = never;

/**
 * IDs of grandparents of {@link CoreShardArg}.
 */
export type CoreShardArgGrandparentIds = never;

/**
 * IDs of parents of {@link CoreShardArg}.
 */
export type CoreShardArgParentIds = typeof coreShardArgParentIds[number];

/**
 * Grid's own shard.
 */
export type ShardPathOwn = CoreArgPath<CoreArgIds.Shard, CoreArgOptionsPathOwn, CoreShardArgParentIds>;

/**
 * Way to get to shard.
 */
export type ShardPathExtended = CoreArgPath<CoreArgIds.Shard, CoreArgOptionsPathExtended, CoreShardArgParentIds>;

/**
 * Core shard arg.
 */
export type CoreShardArg<Options extends CoreArgOptionsUnion> = CoreArgContainerArg<
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentIds,
	CoreGridArg<Options>,
	CoreArgIds.Grid
>;

/**
 * Core shard.
 */
export type CoreShardInstance<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Grid extends CoreGridInstance<BaseClass, Options, any> = CoreGridInstance<BaseClass, Options>
> = CoreUniverseObjectInstance<
	BaseClass,
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
 * Core shard class.
 */
export type CoreShardClass<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Grid extends CoreGridInstance<BaseClass, Options, any> = CoreGridInstance<BaseClass, Options>,
	Shard extends CoreShardInstance<BaseClass, Options, Grid> = CoreShardInstance<BaseClass, Options, Grid>
> = CoreUniverseObjectClass<
	BaseClass,
	Shard,
	CoreShardArg<Options>,
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentId,
	CoreShardArgGrandparentIds,
	Grid,
	CoreGridArg<Options>,
	CoreArgIds.Grid,
	<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>(
		...args: Parameters<
			CoreArgConverter<
				CoreShardArg<SourceOptions>,
				CoreShardArg<TargetOptions>,
				CoreArgIds.Shard,
				SourceOptions,
				TargetOptions,
				CoreShardArgParentIds
			>
		>
	) => ReturnType<
		CoreArgConverter<
			CoreShardArg<SourceOptions>,
			CoreShardArg<TargetOptions>,
			CoreArgIds.Shard,
			SourceOptions,
			TargetOptions,
			CoreShardArgParentIds
		>
	>
>;

/**
 * Tuple with core shard arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
export const coreShardArgParentIds = [] as const;

/**
 * Core shard class factory.
 *
 * @param param - Destructured parameter
 * @returns Shard
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreShardClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Grid extends CoreGridInstance<BaseClass, Options>
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
		CoreShardArg<Options>,
		CoreArgIds.Shard,
		Options,
		CoreShardArgParentIds
	>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateMembersParams = [
		{
			/**
			 * Arg path.
			 */
			arg: CoreShardArg<Options>;
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
	type ReturnClass = Shard extends CoreShardArg<Options> ? typeof Shard : never;

	/**
	 * Interface merging with grid.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Shard
		extends ComputedClassExtractInstance<typeof membersWithChild, GenerateMembersWithChildParams>,
			ComputedClassExtractInstance<typeof members, GenerateMembersParams> {}

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const membersWithChild = generateCoreUniverseObjectContainerMembers<
		BaseClass,
		Grid,
		CoreGridArg<Options>,
		CoreArgIds.Grid,
		Options,
		CoreGridArgParentId,
		CoreGridArgGrandparentIds
	>({
		id: CoreArgIds.Grid,
		options
	});

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = generateCoreUniverseObjectMembers<
		BaseClass,
		CoreShardArg<Options>,
		CoreArgIds.Shard,
		Options,
		CoreShardArgParentId,
		CoreShardArgGrandparentIds,
		Grid,
		CoreGridArg<Options>,
		CoreArgIds.Grid
	>({
		childId: CoreArgIds.Grid,
		id: CoreArgIds.Shard,
		options
	});

	/**
	 * Core shard base class.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class Shard
		// Casting will remove non-static instance information by intersecting with `any`, while maintaining constructor parameters, that will be included into factory return
		extends class extends Base {}
		implements StaticImplements<ToAbstract<CoreShardClass<BaseClass, Options, Grid>>, typeof Shard>
	{
		/**
		 * Default entity.
		 *
		 * @remarks
		 * Redefining.
		 */
		public defaultGrid!: Grid;

		/**
		 * Implemented via {@link generateCoreUniverseObjectMembers}.
		 *
		 * @remarks
		 * TS static property declaration is not required right now.
		 */
		public static getDefaultGridUuid: (path: ShardPathOwn) => Uuid;

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

			// Create child arg, then attach conditional props
			let defaultGridArg: CoreGridArg<Options> = {
				cells: new Map(),

				// Ensures getting uuid from subclass
				gridUuid: (Shard.constructor as typeof Shard).getDefaultGridUuid(this),

				// Extended path
				...(options[CoreArgOptionIds.Path] ===
				coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
					? Array.from(coreGridArgParentIdSet.values()).reduce((r, i) => {
							let uuidPropertyName: CoreArgPathUuidPropertyName<typeof i> = coreArgIdToPathUuidPropertyName({ id: i });
							return { ...r, [uuidPropertyName]: this[uuidPropertyName] };
					  }, {})
					: {})
			} as CoreGridArg<Options>;

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [],
				instance: this,
				members: membersWithChild,
				parameters: []
			});

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [this, [arg, { attachHook, created }, baseParams], defaultGridArg],
				instance: this,
				members,
				parameters: [{ arg }]
			});
		}

		/**
		 * Convert shard args between options.
		 *
		 * Has to strictly follow {@link CoreShardArg}.
		 *
		 * @param param - Destructured parameter
		 * @returns Converted shard args
		 */
		public static convertShard<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>({
			shard,
			sourceOptions,
			targetOptions,
			meta
		}: {
			/**
			 * Core grid args.
			 */
			shard: CoreShardArg<SourceOptions>;

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
			meta: CoreArgMeta<CoreArgIds.Shard, SourceOptions, TargetOptions, CoreShardArgParentIds>;
		}): CoreShardArg<TargetOptions> {
			// Cannot assign to conditional type without casting
			let targetShard: CoreShardArg<TargetOptions> = coreArgConvertContainerArg<
				CoreShardArg<SourceOptions>,
				CoreArgIds.Shard,
				SourceOptions,
				TargetOptions,
				CoreShardArgParentIds,
				CoreGridArg<SourceOptions>,
				CoreGridArg<TargetOptions>,
				CoreArgIds.Grid
			>({
				arg: shard,
				childConverter: (Shard.universe as CoreUniverse<BaseClass, Options>).Grid.convertGrid,
				childId: CoreArgIds.Grid,
				id: CoreArgIds.Shard,
				meta,
				sourceOptions,
				targetOptions
			}) as CoreShardArg<TargetOptions>;

			// Return
			return targetShard;
		}
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Shard,
		members: membersWithChild,
		// Nothing required
		parameters: []
	});

	// Inject static
	computedClassInjectPerClass({
		Base: Shard,
		members,
		// Nothing required
		parameters: []
	});

	return Shard as ReturnClass;
}
