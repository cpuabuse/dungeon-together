/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity.
 */

import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { defaultKindUuid, defaultModeUuid } from "../common/defaults";
import { separator } from "../common/url";
import { StaticImplements, ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import {
	CoreArg,
	CoreArgConverter,
	CoreArgIds,
	CoreArgIndexIds,
	CoreArgIndexObject,
	CoreArgMeta,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	coreArgConvert
} from "./arg";
import { CoreArgOptionsWithKindUnion } from "./arg/kind";
import {
	CoreArgComplexOptionPathIds,
	CoreArgOptionIds,
	CoreArgOptionsOverride,
	CoreArgOptionsUnion,
	coreArgComplexOptionSymbolIndex
} from "./arg/options";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveParameters } from "./base";
import {
	CoreEntityArgGrandparentIds,
	CoreEntityArgParentId,
	CoreEntityArgParentIds,
	coreEntityArgGrandparentIdSet,
	coreEntityArgParentId,
	coreEntityArgParentIdSet
} from "./parents";
import { CoreUniverseClass } from "./universe";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClass,
	CoreUniverseObjectConstructorParameters,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit,
	CoreUniverseObjectInstance,
	generateCoreUniverseObjectMembers
} from "./universe-object";

/**
 * Kind part of entity arg.
 */
type CoreEntityArgKind<Options extends CoreArgOptionsUnion> = Options extends CoreArgOptionsWithKindUnion
	? CoreArgIndexObject<CoreArgIndexIds.Kind, Options, true>
	: object;

/**
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArg<Options extends CoreArgOptionsUnion> = CoreArg<
	CoreArgIds.Entity,
	Options,
	CoreEntityArgParentIds
> &
	CoreArgIndexObject<CoreArgIndexIds.Mode | CoreArgIndexIds.World, Options> &
	CoreEntityArgKind<Options>;

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
 */
export type CoreEntityInstance<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	HasNever extends boolean = false
> = {
	/**
	 * Entity kind.
	 */
	kindUuid: Options[CoreArgOptionIds.Kind] extends true ? Uuid : never;

	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & CoreUniverseObjectInstance<
	BaseParams,
	CoreEntityArg<Options>,
	CoreArgIds.Entity,
	Options,
	CoreEntityArgParentId,
	CoreEntityArgGrandparentIds
> &
	(HasNever extends true ? unknown : CoreEntityArg<Options>);

/**
 * Core entity.
 */
export type CoreEntityClass<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options, true> = CoreEntityInstance<BaseParams, Options, true>
> = CoreUniverseObjectClass<
	BaseParams,
	Entity,
	CoreEntityArg<Options>,
	CoreArgIds.Entity,
	Options,
	CoreEntityArgParentId,
	CoreEntityArgGrandparentIds,
	never,
	never,
	never,
	<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>(
		...args: Parameters<
			CoreArgConverter<
				CoreEntityArg<SourceOptions>,
				CoreEntityArg<TargetOptions>,
				CoreArgIds.Entity,
				SourceOptions,
				TargetOptions,
				CoreEntityArgParentIds
			>
		>
	) => ReturnType<
		CoreArgConverter<
			CoreEntityArg<SourceOptions>,
			CoreEntityArg<TargetOptions>,
			CoreArgIds.Entity,
			SourceOptions,
			TargetOptions,
			CoreEntityArgParentIds
		>
	>
>;

/**
 * Core entity class factory.
 *
 * @param param - Destructured parameter
 * @see {@link CoreBaseClassNonRecursive} for usage
 * @returns Core entity class
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreEntityClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion
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
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentIds
	>;

	/**
	 * Parameters used to construct universe object.
	 */
	type UniverseObjectParams = [
		{
			/**
			 * Arg.
			 */
			arg: CoreEntityArg<Options>;
		}
	];

	/**
	 * Entity interface merging.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Entity extends ComputedClassExtractInstance<typeof members, UniverseObjectParams> {}

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = generateCoreUniverseObjectMembers<
		BaseParams,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentId,
		CoreEntityArgGrandparentIds
	>({
		grandparentIds: coreEntityArgGrandparentIdSet,
		id: CoreArgIds.Entity,
		options,
		parentId: coreEntityArgParentId
	});

	/**
	 * Core entity.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// For interface merging
	// eslint-disable-next-line no-redeclare
	abstract class Entity
		extends class extends Base {}
		implements StaticImplements<ToAbstract<CoreEntityClass<BaseParams, Options>>, typeof Entity>
	{
		/**
		 * Entity kind.
		 *
		 * @remarks
		 * `!`, as conditionally assigned in constructor.
		 */
		public kindUuid!: Options[CoreArgOptionIds.Kind] extends true ? Uuid : never;

		/**
		 * Mode of the entity.
		 */
		public modeUuid: Uuid;

		/**
		 * World in which entity resides.
		 */
		public worldUuid: Uuid;

		// ESLint buggy
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Entity constructor.
		 */
		// ESLint buggy for nested destructured params
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor(...[arg, init, baseParams]: ConstructorParams) {
			/**
			 * Entity with kind.
			 */
			type ArgWithKind = CoreEntityArg<Options & CoreArgOptionsWithKindUnion>;

			super(baseParams);

			// Assign props from arg
			this.modeUuid = arg.modeUuid;
			this.worldUuid = arg.worldUuid;
			if (options[CoreArgOptionIds.Kind] === true) {
				(this as ArgWithKind).kindUuid = (arg as ArgWithKind).kindUuid;
			}

			computedClassInjectPerInstance({
				constructorParameters: [this, [arg, init, baseParams]],
				instance: this,
				members,
				parameters: [{ arg }]
			});
		}

		/**
		 * Converts entity args between options.
		 *
		 * Has to strictly follow {@link CoreEntityArg}.
		 *
		 * @param param - Destructured parameter
		 * @returns Target args entity
		 */
		public static convertEntity<S extends CoreArgOptionsUnion, T extends CoreArgOptionsUnion>({
			entity,
			sourceOptions,
			targetOptions,
			meta
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
			entity: CoreEntityArg<S>;

			/**
			 * Meta for entity.
			 */
			meta: CoreArgMeta<CoreArgIds.Entity, S, T, CoreEntityArgParentIds>;
		}): CoreEntityArg<T> {
			/**
			 * Source options with kind.
			 */
			type SourceOptionsWithKind = CoreArgOptionsOverride<S, CoreArgOptionIds.Kind>;

			/**
			 * Entity with kind.
			 */
			type SourceEntityKind = CoreEntityArgKind<SourceOptionsWithKind>;

			const Universe: CoreUniverseClass<BaseClass, BaseParams, Options> = this.universe
				.constructor as CoreUniverseClass<BaseClass, BaseParams, Options>;

			let targetEntityKind: CoreEntityArgKind<T>;
			let targetEntityMode: CoreArgIndexObject<CoreArgIndexIds.Mode, T>;
			let targetEntityWorld: CoreArgIndexObject<CoreArgIndexIds.World, T>;

			// Assign kind
			if (targetOptions[CoreArgOptionIds.Kind] === true) {
				if (sourceOptions[CoreArgOptionIds.Kind] === true) {
					targetEntityKind = (
						Entity.universe.constructor as CoreUniverseClass<BaseClass, BaseParams, Options>
					).convertIndexObject({
						name: CoreArgIndexIds.Kind,
						namespace: `user`,
						obj: entity as SourceEntityKind,
						sourceOptions: sourceOptions as SourceOptionsWithKind,
						targetOptions
					}) as CoreEntityArgKind<T>;
				} else {
					targetEntityKind = (
						targetOptions.path ===
						coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
							? {}
							: {
									kindUuid: defaultKindUuid
							  }
					) as CoreEntityArgKind<T>;
				}
			} else {
				targetEntityKind = {} as CoreEntityArgKind<T>;
			}

			// Assign mode
			// When source's mode is undefined, `convertIndexObject` will use "default" as mode value instead
			targetEntityMode = Universe.convertIndexObject({
				name: CoreArgIndexIds.Mode,
				// TODO: Use path class
				namespace:
					// If kind, then treat as kind, otherwise, just use default mode
					`${CoreArgIndexIds.Mode}${separator}${
						targetOptions[CoreArgOptionIds.Kind]
							? Universe.convertIndexObjectToPath({
									name: CoreArgIndexIds.Kind,
									obj: targetEntityKind as CoreArgIndexObject<CoreArgIndexIds.Kind, T>,
									options: targetOptions
							  })
							: defaultKindUuid
					}`,
				obj: entity,
				sourceOptions,
				targetOptions
			});

			// Assign world
			targetEntityWorld = Universe.convertIndexObject({
				name: CoreArgIndexIds.World,
				obj: entity,
				sourceOptions,
				targetOptions
			});

			let targetEntity: CoreEntityArg<T> = {
				// Generate path
				...coreArgConvert({
					arg: entity,
					id: CoreArgIds.Entity,
					meta,
					parentIds: coreEntityArgParentIdSet,
					sourceOptions,
					targetOptions
				}),

				// Generate mode
				...targetEntityMode,

				// Generate world
				...targetEntityWorld,

				// Generate kind
				...targetEntityKind

				// Casting required, as generic keys resolve to string
			} as CoreEntityArg<T>;

			// Return
			return targetEntity;
		}
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Entity,
		members,
		// Nothing required
		parameters: []
	});

	// Cast as return
	return Entity;
}
