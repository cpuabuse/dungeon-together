/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity.
 */

import {
	ComputedClassClassConstraint,
	ComputedClassData,
	ComputedClassInfo,
	ComputedClassInstanceConstraint,
	ComputedClassMembers,
	ComputedClassWords
} from "../common/computed-class";
import { defaultKindUuid } from "../common/defaults";
import { AbstractConstructor, StaticImplements } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	coreArgPathConvert
} from "./arg";
import { CoreArgOptionIds, CoreArgOptionsGenerate, CoreArgOptionsUnion } from "./arg/options";
import { CoreBaseClassNonRecursive } from "./base";
import { CellPathExtended, coreCellArgParentIds } from "./cell";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClassConstraintDataExtends,
	CoreUniverseObjectFactory,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit
} from "./universe-object";

// #region To be removed
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
 * Implementable [[CommsEntityArgs]].
 */
export interface CommsEntity extends CommsEntityArgs {
	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}
// #endregion

/**
 * {@link CoreEntityArg} grandparent IDs.
 */
export type CoreEntityArgGrandparentIds = typeof coreEntityArgGrandparentIds[number];

/**
 * {@link CoreEntityArg} parent IDs.
 */
export type CoreEntityArgParentIds = typeof coreEntityArgParentIds[number];

/**
 * Kind part of entity arg.
 */
type CoreEntityArgKind<O extends CoreArgOptionsUnion> = O[CoreArgOptionIds.Kind] extends true
	? {
			/**
			 * Kind of entity.
			 */
			kindUuid: Uuid;
	  }
	: object;

/**
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArg<O extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Entity, O, CoreEntityArgParentIds> & {
	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & CoreEntityArgKind<O>;

/**
 * Path to an entity only.
 */
export type EntityPathOwn = CoreArgPath<CoreArgIds.Entity, CoreArgOptionsPathOwn, CoreEntityArgParentIds>;

/**
 * Path to an entity.
 */
export type EntityPathExtended = CoreArgPath<CoreArgIds.Entity, CoreArgOptionsPathExtended, CoreEntityArgParentIds>;

/**
 * Constraint data.
 */
export type CoreEntityClassConstraintData<Options extends CoreUniverseObjectArgsOptionsUnion> =
	CoreUniverseObjectClassConstraintDataExtends<
		CoreArgIds.Entity,
		Options,
		CoreArgIds.Cell,
		CoreEntityArgGrandparentIds
	> &
		ComputedClassData<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: ComputedClassMembers & {
				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: {
					/**
					 * Kind UUID.
					 */
					kindUuid: Uuid;

					/**
					 * Mode UUID.
					 */
					modeUuid: Uuid;

					/**
					 * World UUID.
					 */
					worldUuid: Uuid;
				};
			};

			/**
			 * Static.
			 */
			[ComputedClassWords.Static]: ComputedClassMembers;
		}>;

/**
 * Core cell.
 */
export type CoreEntity<Options extends CoreUniverseObjectArgsOptionsUnion> = ComputedClassInstanceConstraint<
	CoreEntityClassConstraintData<Options>
>;

/**
 * Typeof class for entities.
 *
 * It may be abstract.
 */
export type CoreEntityClass<Options extends CoreUniverseObjectArgsOptionsUnion> = ComputedClassClassConstraint<
	CoreEntityClassConstraintData<Options>
>;

/**
 * Tuple with core entity arg grandparent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
const coreEntityArgGrandparentIds = [...coreCellArgParentIds] as const;

/**
 * Tuple with core entity arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
export const coreEntityArgParentIds = [...coreCellArgParentIds, CoreArgIds.Cell] as const;

/**
 * Unique set with parent ID's for core entity arg.
 */
export const coreEntityArgParentIdSet: Set<CoreEntityArgParentIds> = new Set(coreEntityArgParentIds);

/**
 * Unique set with grandparent ID's for core entity arg.
 */
export const coreEntityArgGrandparentIdSet: Set<CoreEntityArgGrandparentIds> = new Set(coreEntityArgGrandparentIds);

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
	 * Base constructor parameters.
	 */
	type BaseParams = ConstructorParameters<typeof NewBase>;

	/**
	 * Constructor params.
	 */
	type ConstructorParams = BaseParams;

	/**
	 * Actual class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreEntityClassConstraintData<Options>,
		ComputedClassData<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: InstanceType<typeof NewBase>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: Entity;
			};

			/**
			 * Static.
			 */
			[ComputedClassWords.Static]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: typeof NewBase;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: typeof Entity;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * Class to return.
	 */
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	// Infer the new base for type safe return
	// eslint-disable-next-line @typescript-eslint/typedef
	const NewBase = CoreUniverseObjectFactory<
		BaseClass,
		CoreArgIds.Entity,
		Options,
		CoreArgIds.Cell,
		CoreEntityArgGrandparentIds
	>({
		Base,
		grandparentIds: coreEntityArgGrandparentIdSet,
		id: CoreArgIds.Entity,
		options,
		parentId: CoreArgIds.Cell
	});

	/**
	 * Core entity.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	abstract class Entity
		extends (NewBase as AbstractConstructor<ConstructorParams>)
		implements StaticImplements<ActualClassInfo[ComputedClassWords.ClassImplements], typeof Entity>
	{
		/**
		 * Kind of entity.
		 */
		public abstract kindUuid: Uuid;

		/**
		 * Mode of the entity.
		 */
		public abstract modeUuid: Uuid;

		/**
		 * World in which entity resides.
		 */
		public abstract worldUuid: Uuid;
	}

	// Return as `ReturnClass`, and verify it satisfies arg constraints
	return Entity as InstanceType<ReturnClass> extends CoreEntityArg<Options> ? ReturnClass : never;
}

/**
 * Converts entity args between options.
 *
 * Has to strictly follow {@link CoreEntityArg}.
 *
 * @param param - Destructured parameter
 * @returns Target args entity
 */
export function coreEntityArgsConvert<S extends CoreArgOptionsUnion, T extends CoreArgOptionsUnion>({
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
	// Define source and result, with minimal options
	const sourceEntity: CoreEntityArg<S> = entity;
	const sourceEntityAs: Record<string, any> = sourceEntity;

	let targetEntity: CoreEntityArg<T> = {
		// Generate path
		...coreArgPathConvert({
			id: CoreArgIds.Entity,
			meta,
			parentIds: coreEntityArgParentIdSet,
			sourceArgPath: entity,
			sourceOptions,
			targetOptions
		}),

		// Generate mode
		modeUuid: sourceEntity.modeUuid,

		// Generate world
		worldUuid: sourceEntity.worldUuid,

		// Generate kind
		...(function (): CoreEntityArgKind<T> {
			/**
			 * Entity with kind.
			 */
			type EntityWithKind = CoreEntityArg<CoreArgOptionsGenerate<CoreArgOptionIds.Kind>>;

			let argKind: CoreEntityArgKind<T> =
				targetOptions[CoreArgOptionIds.Kind] === true
					? {
							kindUuid:
								sourceOptions[CoreArgOptionIds.Kind] === true
									? (sourceEntityAs as EntityWithKind).kindUuid
									: defaultKindUuid
					  }
					: ({} as CoreEntityArgKind<T>);

			return argKind;
		})()
	};

	// Return
	return targetEntity;
}

// TODO: Remove
/**
 * Legacy.
 *
 * @param rawSource - Legacy
 * @param path - Legacy
 * @returns - Legacy
 */
export function commsEntityRawToArgs(rawSource: CommsEntityRaw, path: EntityPathExtended): CommsEntityArgs {
	return {
		...path,
		...rawSource
	};
}
