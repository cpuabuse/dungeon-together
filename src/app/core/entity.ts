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
import { defaultKindUuid } from "../common/defaults";
import { StaticImplements } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	coreArgConvert
} from "./arg";
import { CoreArgOptionIds, CoreArgOptionsGenerate, CoreArgOptionsUnion } from "./arg/options";
import { CoreBaseClassNonRecursive } from "./base";
import { CellPathExtended, coreCellArgParentIds } from "./cell";
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
 * Entity parent ID.
 */
export type CoreEntityArgParentId = typeof coreEntityArgParentId;

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
export type CoreEntityArg<Options extends CoreArgOptionsUnion> = CoreArg<
	CoreArgIds.Entity,
	Options,
	CoreEntityArgParentIds
> & {
	/**
	 * Mode of the entity.
	 */
	modeUuid: Uuid;
	/**
	 * World in which entity resides.
	 */
	worldUuid: Uuid;
} & CoreEntityArgKind<Options>;

/**
 * Entity with kind.
 */
export type CoreEntityArgWithKind = CoreEntityArg<CoreArgOptionsGenerate<CoreArgOptionIds.Kind>>;

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
export type CoreEntity<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion
> = CoreEntityArg<Options> &
	CoreUniverseObjectInstance<
		BaseClass,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentId,
		CoreEntityArgGrandparentIds
	>;

// Infer type from `as const` assertion
/* eslint-disable @typescript-eslint/typedef */
/**
 * Entity parent ID.
 */
const coreEntityArgParentId = CoreArgIds.Cell as const;

/**
 * Tuple with core entity arg grandparent IDS.
 */
const coreEntityArgGrandparentIds = [...coreCellArgParentIds] as const;

/**
 * Tuple with core entity arg parent IDS.
 */
export const coreEntityArgParentIds = [...coreCellArgParentIds, coreEntityArgParentId] as const;
/* eslint-enable @typescript-eslint/typedef */

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
	 * Verify class data satisfies arg constraints, `CoreEntity` is not used, as universe object verification already done via `implements`.
	 */
	type ReturnClass = Entity extends CoreEntityArg<Options> ? typeof Entity : never;

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
		BaseClass,
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
		implements
			StaticImplements<
				CoreUniverseObjectClass<
					BaseClass,
					CoreEntityArg<Options>,
					CoreArgIds.Entity,
					Options,
					CoreEntityArgParentId,
					CoreEntityArgGrandparentIds
				>,
				typeof Entity
			>
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
			super(baseParams);

			// Assign props from arg
			this.modeUuid = arg.modeUuid;
			this.worldUuid = arg.worldUuid;
			if (options[CoreArgOptionIds.Kind] === true) {
				(this as CoreEntityArgWithKind).kindUuid = (arg as unknown as CoreEntityArgWithKind).kindUuid;
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
			// Define source and result, with minimal options
			const sourceEntity: CoreEntityArg<S> = entity;
			const sourceEntityAs: Record<string, any> = sourceEntity;

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
				modeUuid: sourceEntity.modeUuid,

				// Generate world
				worldUuid: sourceEntity.worldUuid,

				// Generate kind
				...(function (): CoreEntityArgKind<T> {
					let argKind: CoreEntityArgKind<T> =
						targetOptions[CoreArgOptionIds.Kind] === true
							? {
									kindUuid:
										sourceOptions[CoreArgOptionIds.Kind] === true
											? (sourceEntityAs as CoreEntityArgWithKind).kindUuid
											: defaultKindUuid
							  }
							: ({} as CoreEntityArgKind<T>);

					return argKind;
				})()
			};

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
	return Entity as unknown as ReturnClass;
}
