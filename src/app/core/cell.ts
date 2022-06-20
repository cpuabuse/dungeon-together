/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cell
 */

import {
	ComputedClassExtractInstance,
	computedClassInjectPerClass,
	computedClassInjectPerInstance
} from "../common/computed-class";
import { defaultKindUuid, defaultModeUuid, defaultWorldUuid } from "../common/defaults";
import { StaticImplements, ToAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { Vector, defaultVector, vectorCoords } from "../common/vector";
import {
	CoreArgComplexOptionPathIds,
	CoreArgContainerArg,
	CoreArgConverter,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsOverride,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgOptionsWithMapUnion,
	CoreArgOptionsWithNavUnion,
	CoreArgOptionsWithVectorUnion,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgConvertContainerArg,
	coreArgIdToPathUuidPropertyName
} from "./arg";
import { CoreArgNav } from "./arg/nav";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveParameters } from "./base";
import {
	CommsEntity,
	CommsEntityArgs,
	CommsEntityRaw,
	CoreEntityArg,
	CoreEntityArgGrandparentIds,
	CoreEntityArgParentId,
	CoreEntityArgWithKind,
	CoreEntityInstance,
	EntityPathExtended,
	commsEntityRawToArgs,
	coreEntityArgParentIdSet
} from "./entity";
import { GridPathExtended, coreGridArgParentIds } from "./grid";
import { CoreUniverse } from "./universe";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClass,
	CoreUniverseObjectConstructorParameters,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit,
	CoreUniverseObjectInstance,
	generateCoreUniverseObjectContainerMembers,
	generateCoreUniverseObjectMembers
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
	Omit<CommsCellArgs, "entities" | "worlds" | keyof GridPathExtended> & {
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
 * Cell parent ID.
 */
export type CoreCellArgParentId = typeof coreCellArgParentId;

/**
 * IDs of grandparents of {@link CoreCellArg}.
 */
export type CoreCellArgGrandparentIds = typeof coreCellArgGrandparentIds[number];

/**
 * IDs of parents of {@link CoreCellArg}.
 */
export type CoreCellArgParentIds = typeof coreCellArgParentIds[number];

/**
 * Core cell args.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreCellArg<Options extends CoreArgOptionsUnion> = CoreArgContainerArg<
	CoreArgIds.Cell,
	Options,
	CoreCellArgParentIds,
	CoreEntityArg<Options>,
	CoreArgIds.Entity
> &
	(Options extends CoreArgOptionsWithMapUnion
		? {
				/**
				 * Worlds.
				 */
				worlds: Set<Uuid>;
		  }
		: {
				/**
				 * Worlds.
				 */
				worlds: Array<Uuid>;
		  }) &
	(Options extends CoreArgOptionsWithVectorUnion ? Vector : unknown) &
	(Options extends CoreArgOptionsWithNavUnion ? CoreArgNav<CoreArgIds.Cell, Options, CoreCellArgParentIds> : unknown);

/**
 * Cell own path.
 */
export type CellPathOwn = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathOwn, CoreCellArgParentIds>;

/**
 * Way to get to cell.
 */
export type CellPathExtended = CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathExtended, CoreCellArgParentIds>;

/**
 * Core cell.
 */
export type CoreCellInstance<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options> = CoreEntityInstance<BaseParams, Options>,
	HasNever extends boolean = false
> = {
	/**
	 * Worlds.
	 */
	worlds: Options extends CoreArgOptionsWithMapUnion ? Set<Uuid> : Array<Uuid>;

	/**
	 * Nav.
	 */
	nav: Options extends CoreArgOptionsWithNavUnion
		? CoreArgNav<CoreArgIds.Cell, Options, CoreCellArgParentIds>["nav"]
		: never;
} & {
	[K in keyof Vector]: Options extends CoreArgOptionsWithVectorUnion ? Vector[K] : never;
} & CoreUniverseObjectInstance<
		BaseParams,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentId,
		CoreCellArgGrandparentIds,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity
	> &
	(HasNever extends true ? unknown : CoreCellArg<Options>);

/**
 * Core cell class.
 */
export type CoreCellClass<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options> = CoreEntityInstance<BaseParams, Options>,
	Cell extends CoreCellInstance<BaseParams, Options, Entity, true> = CoreCellInstance<BaseParams, Options, Entity, true>
> = CoreUniverseObjectClass<
	BaseParams,
	Cell,
	CoreCellArg<Options>,
	CoreArgIds.Cell,
	Options,
	CoreCellArgParentId,
	CoreCellArgGrandparentIds,
	Entity,
	CoreEntityArg<Options>,
	CoreArgIds.Entity,
	<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>(
		...args: Parameters<
			CoreArgConverter<
				CoreCellArg<SourceOptions>,
				CoreCellArg<TargetOptions>,
				CoreArgIds.Cell,
				SourceOptions,
				TargetOptions,
				CoreCellArgParentIds
			>
		>
	) => ReturnType<
		CoreArgConverter<
			CoreCellArg<SourceOptions>,
			CoreCellArg<TargetOptions>,
			CoreArgIds.Cell,
			SourceOptions,
			TargetOptions,
			CoreCellArgParentIds
		>
	>
>;

// Infer type from `as const` assertion
/* eslint-disable @typescript-eslint/typedef */
/**
 * Cell parent ID.
 */
const coreCellArgParentId = CoreArgIds.Grid as const;

/**
 * Tuple with core cell arg grandparent IDS.
 */
const coreCellArgGrandparentIds = [...coreGridArgParentIds] as const;

/**
 * Tuple with core cell arg parent IDS.
 */
export const coreCellArgParentIds = [...coreGridArgParentIds, coreCellArgParentId] as const;
/* eslint-enable @typescript-eslint/typedef */

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
	BaseParams extends CoreBaseNonRecursiveParameters,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseParams, Options>
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
	 * Core cell args with vector.
	 */
	type CellWithVector = CoreCellArg<CoreArgOptionsWithVectorUnion>;

	/**
	 * Constructor params.
	 */
	type ConstructorParams = CoreUniverseObjectConstructorParameters<
		BaseParams,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentIds
	>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateMembersParams = [
		{
			/**
			 * Arg path.
			 */
			arg: CoreCellArg<Options>;
		}
	];

	/**
	 * Parameters for generate with child functions.
	 */
	type GenerateMembersWithChildParams = [];

	/**
	 * Cell type merging.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Cell
		extends ComputedClassExtractInstance<typeof membersWithChild, GenerateMembersWithChildParams>,
			ComputedClassExtractInstance<typeof members, GenerateMembersParams> {}

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const membersWithChild = generateCoreUniverseObjectContainerMembers<
		BaseParams,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity,
		Options,
		CoreEntityArgParentId,
		CoreEntityArgGrandparentIds
	>({
		id: CoreArgIds.Entity,
		options
	});

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = generateCoreUniverseObjectMembers<
		BaseParams,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreCellArgParentId,
		CoreCellArgGrandparentIds,
		Entity,
		CoreEntityArg<Options>,
		CoreArgIds.Entity
	>({
		childId: CoreArgIds.Entity,
		grandparentIds: coreCellArgGrandparentIdSet,
		id: CoreArgIds.Cell,
		options,
		parentId: coreCellArgParentId
	});

	/**
	 * Core cell base class.
	 *
	 * @remarks
	 * Coords are `!` defined, as they are conditionally never, and assigned in constructor.
	 *
	 * @see CoreUniverseObjectInherit for more details
	 */
	// For interface merging
	// eslint-disable-next-line no-redeclare
	abstract class Cell
		// Casting will remove non-static instance information by intersecting with `any`, while maintaining constructor parameters, that will be included into factory return
		extends class extends Base {}
		implements
			StaticImplements<
				// Includes container
				ToAbstract<CoreCellClass<BaseParams, Options, Entity>>,
				typeof Cell
			>
	{
		/**
		 * Default entity.
		 *
		 * @remarks
		 * Implemented by {@link generateCoreUniverseObjectMembers}.
		 */
		public defaultEntity!: Entity;

		/**
		 * Implemented via {@link generateCoreUniverseObjectMembers}.
		 *
		 * @remarks
		 * TS static property declaration is not required right now.
		 */
		public static getDefaultEntityUuid: (path: CellPathOwn) => Uuid;

		public nav!: Options extends CoreArgOptionsWithNavUnion
			? CoreArgNav<CoreArgIds.Cell, Options, CoreCellArgParentIds>["nav"]
			: never;

		/**
		 * Worlds.
		 */
		public worlds: Options extends CoreArgOptionsWithMapUnion ? Set<Uuid> : Array<Uuid> = (options[CoreArgOptionIds.Map]
			? new Set()
			: new Array()) as Options extends CoreArgOptionsWithMapUnion ? Set<Uuid> : Array<Uuid>;

		/**
		 * X coordinate.
		 */
		public x!: Options extends CoreArgOptionsWithVectorUnion ? Vector["x"] : never;

		/**
		 * Y coordinate.
		 */
		public y!: Options extends CoreArgOptionsWithVectorUnion ? Vector["y"] : never;

		/**
		 * Z coordinate.
		 */
		public z!: Options extends CoreArgOptionsWithVectorUnion ? Vector["z"] : never;

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
			/**
			 * Cell with nav.
			 */
			type CellNav = CoreArgNav<CoreArgIds.Cell, Options & CoreArgOptionsWithNavUnion, CoreCellArgParentIds>;

			// ESLint false negative, also does not seem to deal well with generics
			// eslint-disable-next-line constructor-super, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			super(baseParams);

			// Create child arg, then attach conditional props
			let defaultEntityArg: CoreEntityArg<Options> = {
				// Ensures getting uuid from subclass
				entityUuid: (Cell.constructor as typeof Cell).getDefaultEntityUuid(this),

				// Extended path
				...(options[CoreArgOptionIds.Path] ===
				coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
					? Array.from(coreEntityArgParentIdSet.values()).reduce((r, i) => {
							let uuidPropertyName: CoreArgPathUuidPropertyName<typeof i> = coreArgIdToPathUuidPropertyName({ id: i });
							return { ...r, [uuidPropertyName]: this[uuidPropertyName] };
					  }, {})
					: {}),

				modeUuid: defaultModeUuid,
				worldUuid: defaultWorldUuid
			} as CoreEntityArg<Options>;
			if (options[CoreArgOptionIds.Kind] === true) {
				(defaultEntityArg as unknown as CoreEntityArgWithKind).kindUuid = defaultKindUuid;
			}

			// Assign vector
			if (options[CoreArgOptionIds.Vector]) {
				vectorCoords.forEach(coord => {
					(this as CellWithVector)[coord] = (arg as unknown as CellWithVector)[coord];
				});
			}

			// Assign nav
			if (options[CoreArgOptionIds.Nav]) {
				// False negative
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				(arg as unknown as CellNav).nav.forEach((v, k) => {
					(this as unknown as CellNav).nav.set(k, v);
				});
			}

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [],
				instance: this,
				members: membersWithChild,
				parameters: []
			});

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [this, [arg, { attachHook, created }, baseParams], defaultEntityArg],
				instance: this,
				members,
				parameters: [{ arg }]
			});
		}

		/**
		 * Convert cell args between options.
		 *
		 * Has to strictly follow {@link CoreCellArg}.
		 *
		 * @param param - Destructured parameter
		 * @returns Converted cell args
		 */
		public static convertCell<SourceOptions extends CoreArgOptionsUnion, TargetOptions extends CoreArgOptionsUnion>({
			cell,
			sourceOptions,
			targetOptions,
			meta
		}: {
			/**
			 * Source options.
			 */
			sourceOptions: SourceOptions;

			/**
			 * Target options.
			 */
			targetOptions: TargetOptions;

			/**
			 * Target source entity.
			 */
			cell: CoreCellArg<SourceOptions>;

			/**
			 * Meta for entity.
			 */
			meta: CoreArgMeta<CoreArgIds.Cell, SourceOptions, TargetOptions, CoreCellArgParentIds>;
		}): CoreCellArg<TargetOptions> {
			/**
			 * Core cell args with map.
			 */
			type TargetCellWithMap = CoreCellArg<TargetOptions & CoreArgOptionsWithMapUnion>;

			/**
			 * Core cell args without map.
			 */
			type TargetCellWithoutMap = CoreCellArg<CoreArgOptionsOverride<TargetOptions, never, CoreArgOptionIds.Map>>;

			/**
			 * Cell with nav.
			 */
			type TargetCellWithNavMap = CoreCellArg<
				CoreArgOptionsOverride<TargetOptions, CoreArgOptionIds.Nav | CoreArgOptionIds.Map>
			>;

			// Arg
			let targetCell: CoreCellArg<TargetOptions> = coreArgConvertContainerArg<
				CoreCellArg<SourceOptions>,
				CoreArgIds.Cell,
				SourceOptions,
				TargetOptions,
				CoreCellArgParentIds,
				CoreEntityArg<SourceOptions>,
				CoreEntityArg<TargetOptions>,
				CoreArgIds.Entity
			>({
				arg: cell,
				// False negative
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
				childConverter: (Cell.universe as CoreUniverse<BaseClass, BaseParams, Options>).Entity.convertEntity,
				childId: CoreArgIds.Entity,
				id: CoreArgIds.Cell,
				meta,
				parentIds: coreCellArgParentIdSet,
				sourceOptions,
				targetOptions
			}) as CoreCellArg<TargetOptions>;

			// Vector
			if (targetOptions[CoreArgOptionIds.Vector]) {
				if (sourceOptions[CoreArgOptionIds.Vector] === true) {
					// Source to target
					// Convert to `unknown` as does not overlap
					(targetCell as unknown as CellWithVector).x = (cell as unknown as CellWithVector).x;
					(targetCell as unknown as CellWithVector).y = (cell as unknown as CellWithVector).y;
					(targetCell as unknown as CellWithVector).z = (cell as unknown as CellWithVector).z;
				} else {
					// Assign default vector
					Object.assign(targetCell, defaultVector);
				}
			}

			// Map
			if (targetOptions[CoreArgOptionIds.Map]) {
				// Worlds
				(targetCell as TargetCellWithMap).worlds = new Set(cell.worlds);
			} else {
				// Worlds
				(targetCell as TargetCellWithoutMap).worlds = Array.from(cell.worlds);
			}

			// Nav
			if (targetOptions[CoreArgOptionIds.Nav]) {
				if (targetOptions[CoreArgOptionIds.Map]) {
					(targetCell as unknown as TargetCellWithNavMap).nav = new Map();
				}
			}

			// Return
			return targetCell;
		}
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Cell,
		members: membersWithChild,
		// Nothing required
		parameters: []
	});

	// Inject static
	computedClassInjectPerClass({
		Base: Cell,
		members,
		// Nothing required
		parameters: []
	});

	// Have to re-inject dynamic bits from generic parents
	return Cell;
}
