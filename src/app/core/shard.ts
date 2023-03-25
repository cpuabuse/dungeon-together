/*
	Copyright 2023 cpuabuse.com
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
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveParameters } from "./base";
import { CoreGridArg, CoreGridInstance } from "./grid";
import {
	CoreGridArgGrandparentIds,
	CoreGridArgParentId,
	CoreShardArgGrandparentIds,
	CoreShardArgParentId,
	CoreShardArgParentIds,
	coreGridArgParentIdSet
} from "./parents";
import { CoreUniverse } from "./universe";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClass,
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectInstance,
	generateCoreUniverseObjectContainerMembers,
	generateCoreUniverseObjectMembers
} from "./universe-object";

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
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Grid extends CoreGridInstance<BaseParams, Options, any> = CoreGridInstance<BaseParams, Options>,
	HasNever extends boolean = false
> = CoreUniverseObjectInstance<
	BaseParams,
	CoreShardArg<Options>,
	CoreArgIds.Shard,
	Options,
	CoreShardArgParentId,
	CoreShardArgGrandparentIds,
	Grid,
	CoreGridArg<Options>,
	CoreArgIds.Grid
> &
	(HasNever extends true ? unknown : CoreShardArg<Options>);

/**
 * Core shard class.
 */
export type CoreShardClass<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	// `any` effectively means being agnostic to grandchildren, as generic expression is not dependent on it
	Grid extends CoreGridInstance<BaseParams, Options, any> = CoreGridInstance<BaseParams, Options>,
	Shard extends CoreShardInstance<BaseParams, Options, Grid, true> = CoreShardInstance<BaseParams, Options, Grid, true>
> = CoreUniverseObjectClass<
	BaseParams,
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
 * Core shard class factory.
 *
 * @param param - Destructured parameter
 * @returns Shard
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreShardClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Grid extends CoreGridInstance<BaseParams, Options, any>
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
		BaseParams,
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
		BaseParams,
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
		BaseParams,
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
		implements StaticImplements<ToAbstract<CoreShardClass<BaseParams, Options, Grid>>, typeof Shard>
	{
		/**
		 * Connection uuid.
		 */
		public connectionUuid: Uuid;

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
				gridUuid: Shard.getDefaultGridUuid(arg),

				// Vector
				x: 0,
				y: 0,
				z: 0,

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

			// TODO: Use appropriate UUID generator function
			this.connectionUuid = `connection/${this.shardUuid}`;
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
				// False negative
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
				childConverter: (Shard.universe as CoreUniverse<BaseClass, BaseParams, Options>).Grid.convertGrid.bind(
					(Shard.universe as CoreUniverse<BaseClass, BaseParams, Options>).Grid
				),
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

	return Shard;
}
