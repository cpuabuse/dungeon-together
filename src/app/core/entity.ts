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
import { AbstractConstructor, StaticImplements, StaticMembers } from "../common/utility-types";
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
	CoreUniverseObjectConstructorParameters,
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
 * Constraint for core entity arg.
 */
type CoreEntityArgConstraintData<Options extends CoreArgOptionsUnion> = ComputedClassData<{
	/**
	 * Instance.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers & {
		/**
		 * Base.
		 */
		[ComputedClassWords.Base]: CoreArg<CoreArgIds.Entity, Options, CoreEntityArgParentIds>;

		/**
		 * Populate.
		 */
		[ComputedClassWords.Populate]: {
			/**
			 * Mode of the entity.
			 */
			modeUuid: Uuid;
			/**
			 * World in which entity resides.
			 */
			worldUuid: Uuid;
		};

		/**
		 * Implements.
		 */
		[ComputedClassWords.Implement]: CoreEntityArgKind<Options>;
	};

	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers;
}>;

/**
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArg<Options extends CoreArgOptionsUnion> = ComputedClassInstanceConstraint<
	CoreEntityArgConstraintData<Options>
>;

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
		CoreBaseClassNonRecursive,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreArgIds.Cell,
		CoreEntityArgGrandparentIds
	> &
		ComputedClassData<CoreEntityArgConstraintData<Options>>;

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
	CoreEntityClassConstraintData<Options>,
	CoreUniverseObjectConstructorParameters<
		CoreBaseClassNonRecursive,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentIds
	>
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
	 * Parameter constraint for class to extend.
	 */
	type SuperConstructorExtends = AbstractConstructor<
		CoreUniverseObjectConstructorParameters<
			BaseClass,
			CoreEntityArg<Options>,
			CoreArgIds.Entity,
			Options,
			CoreEntityArgParentIds
		>
	>;

	/**
	 * Super class to extend.
	 *
	 * @remarks
	 * Constrains actual super class to extends to be used, if fails, the return result will be never.
	 */
	type SuperClass = typeof NewBase extends SuperConstructorExtends ? typeof NewBase : never;

	/**
	 * Constructor params.
	 */
	type ConstructorParams = CoreUniverseObjectConstructorParameters<
		BaseClass,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentIds
	>;

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
				[ComputedClassWords.Base]: InstanceType<SuperClass>;

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
				[ComputedClassWords.Base]: StaticMembers<SuperClass>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: StaticMembers<typeof Entity>;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * New instance type to use as `this`.
	 */
	// Saved for future use
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type ThisInstanceConcrete = ActualClassInfo[ComputedClassWords.ThisInstanceConcrete];

	/**
	 * Class to return.
	 */
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	// Infer the new base for type safe return
	// eslint-disable-next-line @typescript-eslint/typedef
	const NewBase = CoreUniverseObjectFactory<
		BaseClass,
		CoreEntityArg<Options>,
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
		extends (NewBase as SuperConstructorExtends)
		implements StaticImplements<ActualClassInfo[ComputedClassWords.ClassImplements], typeof Entity>
	{
		/**
		 * Mode of the entity.
		 */
		public abstract modeUuid: Uuid;

		/**
		 * World in which entity resides.
		 */
		public abstract worldUuid: Uuid;

		// ESLint buggy
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Entity constructor.
		 */
		// ESLint buggy for nested destructured params
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor(...[arg, { created, attachHook }, baseParams]: ConstructorParams) {
			// ESLint does not like casting on `extends`, also does not seem to deal well with generics
			// eslint-disable-next-line constructor-super, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			super(arg, { attachHook, created }, baseParams);
		}
	}

	// Return as `ReturnClass`, and verify constraint data satisfies arg constraints
	return Entity as ReturnClass;
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
