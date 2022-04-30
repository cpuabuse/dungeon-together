/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cell
 */

import {
	ComputedClassClassConstraint,
	ComputedClassData,
	ComputedClassExtractInstance,
	ComputedClassInfo,
	ComputedClassInstanceConstraint,
	ComputedClassMembers,
	ComputedClassWords,
	computedClassGenerate
} from "../common/computed-class";
import { AbstractConstructor, StaticImplements, StaticMembers } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { Vector } from "../common/vector";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgOptionsWithMap,
	CoreArgOptionsWithoutMap,
	CoreArgPath,
	CoreArgsContainer,
	coreArgChildMetaGenerate,
	coreArgPathConvert
} from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CommsEntity,
	CommsEntityArgs,
	CommsEntityRaw,
	CoreEntity,
	CoreEntityArg,
	CoreEntityArgParentIds,
	CoreEntityClass,
	EntityPathExtended,
	commsEntityRawToArgs,
	coreEntityArgsConvert
} from "./entity";
import { GridPath } from "./grid";
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
 * A location-like.
 */
export interface CommsCellArgs extends CellPathExtended, Vector {
	/**
	 * Array of entities.
	 */
	entities: Map<Uuid, CommsEntityArgs>;

	/**
	 * Worlds.
	 */
	worlds: Set<Uuid>;
}

/**
 * Helper for [[CommsCellRaw]].
 */
type CommCellRawHelper<A, B> = (A & B) | A;

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsCellRaw = CommCellRawHelper<
	Omit<CommsCellArgs, "entities" | "worlds" | keyof GridPath> & {
		/**
		 * Entities.
		 */
		entities: Array<CommsEntityRaw>;

		/**
		 * Worlds.
		 */
		worlds?: Array<Uuid>;
	},
	Vector
>;

/**
 * Cell implementable.
 */
export interface CommsCell extends CommsCellArgs {
	/**
	 * Default [[Entity]] UUID.
	 */
	defaultEntityUuid: Uuid;

	/**
	 * Adds [[Entity]].
	 */
	addEntity(entity: CommsEntityArgs): void;

	/**
	 * Gets [[Entity]].
	 */
	getEntity(path: EntityPathExtended): CommsEntity;

	/**
	 * Removes [[Entity]].
	 */
	removeEntity(path: EntityPathExtended): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Converts [[CommsCellRaw]] to [[CommsCellArgs]].
 *
 * @param rawSource - Raw source
 * @param path - Path
 * @returns Result of conversion
 */
export function commsCellRawToArgs(rawSource: CommsCellRaw, path: CellPathExtended): CommsCellArgs {
	return {
		...path,
		cellUuid: rawSource.cellUuid,
		entities: new Map(
			rawSource.entities.map(entity => {
				return [
					entity.entityUuid,
					commsEntityRawToArgs(entity, {
						...path,
						entityUuid: entity.entityUuid
					})
				];
			})
		),
		worlds: new Set(rawSource.worlds),
		x: rawSource.x,
		y: rawSource.y,
		z: rawSource.z
	};
}
// #endregion

/**
 * IDs of grandparents of {@link CoreCellArg}.
 */
export type CoreCellArgGrandparentIds = typeof coreCellArgGrandparentIds[number];

/**
 * IDs of parents of {@link CoreCellArg}.
 */
export type CoreCellArgParentIds = typeof coreCellArgParentIds[number];

/**
 * Core cell arg constraint data.
 */
type CoreCellArgConstraintData<Options extends CoreArgOptionsUnion> = ComputedClassData<{
	/**
	 * Instance.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers & {
		/**
		 * Base.
		 */
		[ComputedClassWords.Base]: CoreArg<CoreArgIds.Cell, Options, CoreCellArgParentIds> &
			CoreArgsContainer<CoreEntityArg<Options>, CoreArgIds.Entity, Options, CoreEntityArgParentIds>;

		/**
		 * Populate.
		 */
		[ComputedClassWords.Populate]: {
			/**
			 * Worlds.
			 */
			worlds: Options[CoreArgOptionIds.Map] extends true ? Set<Uuid> : Array<Uuid>;
		};

		/**
		 * Inject.
		 */
		[ComputedClassWords.Inject]: Options[CoreArgOptionIds.Vector] extends true ? Vector : object;
	};

	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers;
}>;

/**
 * Core cell args.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreCellArg<Options extends CoreArgOptionsUnion> = ComputedClassInstanceConstraint<
	CoreCellArgConstraintData<Options>
>;

/**
 * Cell own path.
 */
export type CellPathOwn = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathOwn, CoreCellArgParentIds>;

/**
 * Way to get to cell.
 */
export type CellPathExtended = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathExtended, CoreCellArgParentIds>;

/**
 * Class data for core cell.
 */
type CoreCellClassConstraintData<
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntity<Options>
> = CoreUniverseObjectClassConstraintDataExtends<
	CoreBaseClassNonRecursive,
	CoreCellArg<Options>,
	CoreArgIds.Cell,
	Options,
	CoreArgIds.Grid,
	CoreCellArgGrandparentIds,
	Entity,
	CoreEntityArg<Options>,
	CoreArgIds.Entity
> &
	ComputedClassData<CoreCellArgConstraintData<Options>>;

/**
 * Core cell.
 */
export type CoreCell<
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntity<Options> = CoreEntity<Options>
> = ComputedClassInstanceConstraint<CoreCellClassConstraintData<Options, Entity>>;

/**
 * Core cell class.
 */
export type CoreCellClass<
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntity<Options> = CoreEntity<Options>
> = ComputedClassClassConstraint<CoreCellClassConstraintData<Options, Entity>>;

/**
 * Tuple with core cell arg grandparent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
const coreCellArgGrandparentIds = [CoreArgIds.Shard] as const;

/**
 * Tuple with core cell arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
export const coreCellArgParentIds = [...coreCellArgGrandparentIds, CoreArgIds.Grid] as const;

/**
 * Unique set with grandparent ID's for core cell arg.
 */
export const coreCellArgGrandparentIdSet: Set<CoreCellArgGrandparentIds> = new Set(coreCellArgGrandparentIds);

/**
 * Unique set with parent ID's for core cell arg.
 */
export const coreCellArgParentIdSet: Set<CoreCellArgParentIds> = new Set(coreCellArgParentIds);

/**
 * Factory for core cell.
 *
 * @param param - Destructure parameter
 * @see {@link CoreBaseClassNonRecursive} for usage
 * @returns Cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreCellClassFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	EntityClass extends CoreEntityClass<Options>
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
			CoreCellArg<Options>,
			CoreArgIds.Cell,
			Options,
			CoreCellArgParentIds
		>
	>;

	/**
	 * Super class.
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
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentIds
	>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateParams = [
		{
			/**
			 * Arg path.
			 */
			path: CoreCellArg<Options>;
		}
	];

	/**
	 * Class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreCellClassConstraintData<Options, InstanceType<EntityClass>>,
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
				[ComputedClassWords.Populate]: Cell;

				/**
				 * Inject.
				 */
				[ComputedClassWords.Inject]: ComputedClassExtractInstance<typeof members, ThisInstanceConcrete, GenerateParams>;
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
				[ComputedClassWords.Populate]: StaticMembers<typeof Cell>;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * New instance type to use as `this`.
	 */
	type ThisInstanceConcrete = ActualClassInfo[ComputedClassWords.ThisInstanceConcrete];

	/**
	 * New class to re-inject.
	 */
	// Intersection preserves constructor parameters of core cell, and instance type of base class
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	/**
	 * Members to inject for vector.
	 */
	type MaybeVectorMembers<Key extends "generate"> = Options[CoreArgOptionIds.Vector] extends true
		? Exclude<typeof vectorData["vectorMembers"], undefined>[Key]
		: Exclude<typeof vectorData["nonVectorMembers"], undefined>[Key];

	// Infer the new base for type safe return
	// eslint-disable-next-line @typescript-eslint/typedef
	const NewBase = CoreUniverseObjectFactory<
		BaseClass,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreArgIds.Grid,
		CoreCellArgGrandparentIds,
		CoreEntity<Options>,
		CoreEntityArg<Options>,
		CoreArgIds.Entity
	>({
		Base,
		childId: CoreArgIds.Entity,
		grandparentIds: coreCellArgGrandparentIdSet,
		id: CoreArgIds.Cell,
		options,
		parentId: CoreArgIds.Grid
	});

	// Want to infer
	// eslint-disable-next-line @typescript-eslint/typedef
	const coords = ["x", "y", "z"] as const;

	/**
	 * Members injected, when not having a vector.
	 *
	 * @remarks
	 * `present` is the discriminant.
	 */
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	let vectorData =
		options.vector === true
			? {
					present: true as const,
					vectorMembers: {
						generate: {
							...coords.reduce(
								(result, name) => ({
									...result,
									[name]: {
										name,

										// ESLint buggy
										// eslint-disable-next-line jsdoc/require-param
										/**
										 * Moves universe object to a different parent.
										 *
										 * @param this - Destructured `this`
										 * @param path - Parent path
										 * @returns Coordinate
										 */
										// Arg should be present for type
										// eslint-disable-next-line @typescript-eslint/no-unused-vars
										value(this: ThisInstanceConcrete, ...args: GenerateParams): number {
											return 0;
										}
									}
								}),
								{} as {
									[K in typeof coords[any]]: {
										/**
										 * Name.
										 */
										name: K;

										/**
										 * Value.
										 */
										value: (this: ThisInstanceConcrete, ...args: GenerateParams) => number;
									};
								}
							)
						}
					}
			  }
			: {
					nonVectorMembers: {
						generate: {}
					},

					present: false as const
			  };

	// Members
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	let members = {
		generate: {
			...((vectorData.present === true ? vectorData.vectorMembers : vectorData.nonVectorMembers)
				.generate as MaybeVectorMembers<"generate">)
		}
	};

	/**
	 * Core cell base class.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class Cell
		// Casting will remove non-static instance information by intersecting with `any`, while maintaining constructor parameters, that will be included into factory return
		extends (NewBase as SuperConstructorExtends)
		implements StaticImplements<ActualClassInfo[ComputedClassWords.ClassImplements], typeof Cell>
	{
		/**
		 * Default entity.
		 */
		public abstract defaultEntity: InstanceType<EntityClass>;

		/**
		 * Worlds.
		 */
		public worlds: CoreCellArg<Options>["worlds"] = (options[CoreArgOptionIds.Map]
			? new Set()
			: new Array()) as CoreCellArg<Options>["worlds"];

		// ESLint buggy
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 *
		 * @param args - Constructor parameters
		 */
		// ESLint buggy for nested destructured params
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor(...[cell, { created, attachHook }, baseParams]: ConstructorParams) {
			// ESLint false negative, also does not seem to deal well with generics
			// eslint-disable-next-line constructor-super, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			super(cell, { attachHook, created }, baseParams);

			// Assign properties
			computedClassGenerate({
				args: [{ path: cell }],
				members,
				that: this as unknown as ThisInstanceConcrete
			});
		}
	}

	// Have to re-inject dynamic bits from generic parents
	return Cell as ReturnClass;
}

/**
 * Convert cell args between options.
 *
 * Has to strictly follow {@link CoreCellArg}.
 *
 * @param param - Destructured parameter
 * @returns Converted cell args
 */
export function coreCellArgsConvert<
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion
>({
	cell,
	sourceOptions,
	targetOptions,
	meta
}: {
	/**
	 * Core cell args.
	 */
	cell: CoreCellArg<SourceOptions>;

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
	meta: CoreArgMeta<CoreArgIds.Cell, SourceOptions, TargetOptions, CoreCellArgParentIds>;
}): CoreCellArg<TargetOptions> {
	/**
	 * Core cell args with vector.
	 */
	type CellWithVector = CoreCellArg<CoreArgOptionsGenerate<CoreArgOptionIds.Vector>>;

	/**
	 * Core cell args with map.
	 */
	type CellWithMap = CoreCellArg<CoreArgOptionsWithMap>;

	/**
	 * Core cell args without map.
	 */
	type CellWithoutMap = CoreCellArg<CoreArgOptionsWithoutMap>;

	/**
	 * Core entity args with map.
	 */
	type EntityWithMap = CoreEntityArg<CoreArgOptionsWithMap>;

	/**
	 * Core entity args without map.
	 */
	type EntityWithoutMap = CoreEntityArg<CoreArgOptionsWithoutMap>;

	/**
	 * Convert child.
	 *
	 * @param param - Destructure parameter
	 * @returns Converted child
	 */
	function entityArgsConvert({
		entity,
		index
	}: {
		/**
		 * Entity.
		 */
		entity: CoreEntityArg<SourceOptions>;

		/**
		 * Index.
		 */
		index: number;
	}): CoreEntityArg<TargetOptions> {
		return coreEntityArgsConvert({
			entity,

			meta: coreArgChildMetaGenerate({
				childArgId: CoreArgIds.Entity,
				index,
				meta,
				parentArgId: CoreArgIds.Cell,
				sourceOptions,
				sourceParentArg: cell,
				targetOptions
			}),

			// Cast to expected type
			sourceOptions,
			// Cast to expected type
			targetOptions
		});
	}

	// Cannot assign to conditional type without casting
	let targetCell: CoreCellArg<TargetOptions> = {} as CoreCellArg<TargetOptions>;

	// Assign the path
	Object.assign(
		targetCell,
		coreArgPathConvert({
			id: CoreArgIds.Cell,
			meta,
			parentIds: coreCellArgParentIdSet,
			sourceArgPath: cell,
			sourceOptions,
			targetOptions
		})
	);

	// Vector
	if (targetOptions[CoreArgOptionIds.Vector] === true) {
		if (sourceOptions[CoreArgOptionIds.Vector] === true) {
			// Source to target
			// Convert to `unknown` as does not overlap
			(targetCell as unknown as CellWithVector).x = (cell as unknown as CellWithVector).x;
			(targetCell as unknown as CellWithVector).y = (cell as unknown as CellWithVector).y;
			(targetCell as unknown as CellWithVector).z = (cell as unknown as CellWithVector).z;
		} else {
			// Default to `0`
			// Convert to `unknown` as does not overlap
			(targetCell as unknown as CellWithVector).x = 0;
			(targetCell as unknown as CellWithVector).y = 0;
			(targetCell as unknown as CellWithVector).z = 0;
		}
	}

	// Map
	if (targetOptions[CoreArgOptionIds.Map] === true) {
		// Worlds
		(targetCell as CellWithMap).worlds = new Set(cell.worlds);

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Entities
			(targetCell as CellWithMap).entities = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from((cell as CellWithMap).entities, ([uuid, entity], index) => [
					uuid,
					// Cast arguments back to generic type, and result to expected type
					entityArgsConvert({ entity: entity as CoreEntityArg<SourceOptions>, index }) as EntityWithMap
				])
			);
		} else {
			// Entities
			(targetCell as CellWithMap).entities = new Map(
				(cell as CellWithoutMap).entities.map((entity, index) => [
					entity.entityUuid,
					// Cast arguments back to generic type, and result to expected type
					entityArgsConvert({ entity: entity as CoreEntityArg<SourceOptions>, index }) as EntityWithMap
				])
			);
		}
	} else {
		// Worlds
		(targetCell as CellWithoutMap).worlds = Array.from(cell.worlds);

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Entities
			(targetCell as CellWithoutMap).entities = Array.from(
				(cell as CellWithMap).entities,
				// Argument types correctly inferred from "Array.from()", probably eslint bug, and UUID is unused
				// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
				([uuid, entity], index) =>
					// Set to actual type
					// Cast arguments back to generic type, and result to expected type
					entityArgsConvert({ entity: entity as CoreEntityArg<SourceOptions>, index }) as EntityWithoutMap
			);
		} else {
			// Entities
			(targetCell as CellWithoutMap).entities = (cell as CellWithoutMap).entities.map(
				(entity, index) =>
					// Cast arguments back to generic type, and result to expected type
					entityArgsConvert({ entity: entity as CoreEntityArg<SourceOptions>, index }) as EntityWithoutMap
			);
		}
	}
	// Return
	return targetCell;
}
