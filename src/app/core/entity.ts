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
import { defaultCellUuid, defaultGridUuid, defaultKindUuid, defaultShardUuid } from "../common/defaults";
import { AbstractConstructor, StaticImplements } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CoreArg, CoreArgIds, CoreArgOptionsPathExtended, CoreArgOptionsPathOwn, CoreArgPath } from "./arg";
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
 * {@link CoreEntityArgs} grandparent IDs.
 */
export type CoreEntityArgGrandparentIds = typeof coreEntityArgGrandparentIds[number];

/**
 * {@link CoreEntityArgs} parent IDs.
 */
export type CoreEntityArgParentIds = typeof coreEntityArgParentIds[number];

/**
 * Core entity.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreEntityArgs<O extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Entity, O, CoreEntityArgParentIds> & {
	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;

	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & (O[CoreArgOptionIds.Kind] extends true
		? {
				/**
				 * Kind of entity.
				 */
				kindUuid: Uuid;
		  }
		: unknown);

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
	CoreUniverseObjectClassConstraintDataExtends<CoreArgIds.Entity, Options, CoreEntityArgGrandparentIds> &
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
	 * New instance type to use as `this`.
	 */
	type ThisInstanceConcrete = ActualClassInfo[ComputedClassWords.ThisInstanceConcrete];

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

	return Entity as ReturnClass;
}

/**
 * @param rawSource
 * @param path
 */
export function commsEntityRawToArgs(rawSource: CommsEntityRaw, path: EntityPathExtended): CommsEntityArgs {
	return {
		...path,
		...rawSource
	};
}

/**
 * Converts entity args between options.
 *
 * Has to strictly follow {@link CoreEntityArgs}.
 *
 * @param param - Destructured parameter
 * @returns Target args entity
 */
export function coreEntityArgsConvert<S extends CoreArgOptionsUnion, T extends CoreArgOptionsUnion>({
	entity,
	sourceOptions,
	targetOptions
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
	entity: CoreEntityArgs<S>;
}): CoreEntityArgs<T> {
	// Define source and result, with minimal options
	const sourceEntity: CoreEntityArgs<S> = entity;
	const sourceEntityAs: Record<string, any> = sourceEntity;
	// Cannot assign to conditional type without casting
	let targetEntity: CoreEntityArgs<T> = {
		entityUuid: sourceEntity.entityUuid,
		modeUuid: sourceEntity.modeUuid,
		worldUuid: sourceEntity.worldUuid
	} as CoreEntityArgs<T>;
	let targetEntityAs: Record<string, any> = targetEntity;

	// Path
	if (targetOptions[CoreArgOptionIds.Path] === true) {
		/**
		 * Entity with path.
		 */
		type EntityWithPath = CoreEntityArgs<CoreArgOptionsGenerate<CoreArgOptionIds.Path>>;
		let targetEntityWithPath: EntityWithPath = targetEntityAs as EntityWithPath;
		if (sourceOptions[CoreArgOptionIds.Path] === true) {
			const sourceEntityWithPath: EntityWithPath = sourceEntityAs as EntityWithPath;
			targetEntityWithPath.shardUuid = sourceEntityWithPath.shardUuid;
			targetEntityWithPath.gridUuid = sourceEntityWithPath.gridUuid;
			targetEntityWithPath.cellUuid = sourceEntityWithPath.cellUuid;
		} else {
			targetEntityWithPath.shardUuid = defaultShardUuid;
			targetEntityWithPath.gridUuid = defaultGridUuid;
			targetEntityWithPath.cellUuid = defaultCellUuid;
		}
	}

	// Kind
	if (targetOptions[CoreArgOptionIds.Kind] === true) {
		/**
		 * Entity with kind.
		 */
		type EntityWithKind = CoreEntityArgs<CoreArgOptionsGenerate<CoreArgOptionIds.Kind>>;
		let targetEntityWithKind: EntityWithKind = targetEntityAs as EntityWithKind;
		if (sourceOptions[CoreArgOptionIds.Kind] === true) {
			targetEntityWithKind.kindUuid = (sourceEntityAs as EntityWithKind).kindUuid;
		} else {
			targetEntityWithKind.kindUuid = defaultKindUuid;
		}
	}

	// Return
	return targetEntity;
}
