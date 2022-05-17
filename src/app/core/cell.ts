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
import { StaticImplements } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { Vector, VectorCoord, defaultVector } from "../common/vector";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgOptionsWithMapUnion,
	CoreArgOptionsWithVectorUnion,
	CoreArgOptionsWithoutMapUnion,
	CoreArgPath,
	CoreArgsContainer,
	coreArgPathConvert
} from "./arg";
import { CoreArgConverter, coreArgContainerConvert } from "./arg/convert-container";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CommsEntity,
	CommsEntityArgs,
	CommsEntityRaw,
	CoreEntity,
	CoreEntityArg,
	CoreEntityArgParentIds,
	EntityPathExtended,
	commsEntityRawToArgs
} from "./entity";
import { GridPathExtended, coreGridArgParentIds } from "./grid";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectClass,
	CoreUniverseObjectConstructorParameters,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreUniverseObjectInherit,
	CoreUniverseObjectInstance,
	CoreUniverseObjectUniverse,
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
export type CoreCellArg<Options extends CoreArgOptionsUnion> = CoreArg<CoreArgIds.Cell, Options, CoreCellArgParentIds> &
	CoreArgsContainer<CoreEntityArg<Options>, CoreArgIds.Entity, Options, CoreEntityArgParentIds> & {
		/**
		 * Worlds.
		 */
		worlds: Options[CoreArgOptionIds.Map] extends true ? Set<Uuid> : Array<Uuid>;
	} & (Options extends CoreArgOptionsWithVectorUnion ? Vector : unknown);

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
export type CoreCell<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntity<BaseClass, Options> = CoreEntity<BaseClass, Options>
> = CoreCellArg<Options> &
	CoreUniverseObjectInstance<
		BaseClass,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreArgIds.Grid,
		CoreCellArgGrandparentIds,
		Entity,
		CoreArgIds.Entity
	>;

/**
 * Tuple with core cell arg grandparent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
const coreCellArgGrandparentIds = [...coreGridArgParentIds] as const;

/**
 * Tuple with core cell arg parent IDS.
 */
// Infer type from `as const` assertion
// eslint-disable-next-line @typescript-eslint/typedef
export const coreCellArgParentIds = [...coreGridArgParentIds, CoreArgIds.Grid] as const;

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
	Entity extends CoreEntity<BaseClass, Options>
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
			arg: CoreCellArg<Options>;
		}
	];

	/**
	 * Verify class data satisfies arg constraints.
	 */
	type ReturnClass = Cell extends CoreEntityArg<Options> ? typeof Cell : never;

	/**
	 * Cell type merging.
	 */
	// Merging
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Cell extends ComputedClassExtractInstance<typeof members, GenerateParams> {}

	// Have to infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = generateCoreUniverseObjectMembers<
		BaseClass,
		CoreCellArg<Options>,
		CoreArgIds.Cell,
		Options,
		CoreArgIds.Grid,
		CoreCellArgGrandparentIds
	>({
		grandparentIds: coreCellArgGrandparentIdSet,
		id: CoreArgIds.Cell,
		options,
		parentId: CoreArgIds.Grid
	});

	/**
	 * Core cell base class.
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
				CoreUniverseObjectClass<
					BaseClass,
					CoreCellArg<Options>,
					CoreArgIds.Cell,
					Options,
					CoreArgIds.Grid,
					CoreCellArgGrandparentIds
				>,
				typeof Cell
			>
	{
		/**
		 * X coordinate.
		 */
		public [VectorCoord.X]: Options extends CoreArgOptionsWithVectorUnion ? Vector[VectorCoord.X] : never;

		/**
		 * Y coordinate.
		 */
		public [VectorCoord.X]: Options extends CoreArgOptionsWithVectorUnion ? Vector[VectorCoord.X] : never;

		/**
		 * Z coordinate.
		 */
		public [VectorCoord.Z]: Options extends CoreArgOptionsWithVectorUnion ? Vector[VectorCoord.X] : never;

		/**
		 * Default entity.
		 */
		public abstract defaultEntity: Entity;

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
		public constructor(...[arg, init, baseParams]: ConstructorParams) {
			// ESLint false negative, also does not seem to deal well with generics
			// eslint-disable-next-line constructor-super, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			super(arg, init, baseParams);

			// Assign properties
			computedClassInjectPerInstance({
				constructorParameters: [this, [arg, init, baseParams]],
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
			 * Core cell args with vector.
			 */
			type CellWithVector = CoreCellArg<CoreArgOptionsWithVectorUnion>;

			/**
			 * Core cell args with map.
			 */
			type CellWithMap = CoreCellArg<CoreArgOptionsWithMapUnion>;

			/**
			 * Core cell args without map.
			 */
			type CellWithoutMap = CoreCellArg<CoreArgOptionsWithoutMapUnion>;

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
					// Assign default vector
					Object.assign(targetCell, defaultVector);
				}
			}

			// Map
			if (targetOptions[CoreArgOptionIds.Map] === true) {
				// Worlds
				(targetCell as CellWithMap).worlds = new Set(cell.worlds);
			} else {
				// Worlds
				(targetCell as CellWithoutMap).worlds = Array.from(cell.worlds);
			}

			// Deal with children
			Object.assign(
				targetCell,
				coreArgContainerConvert({
					arg: cell,
					childConverter: (
						Cell.universe as CoreUniverseObjectUniverse<
							BaseClass,
							Entity,
							CoreEntityArg<Options>,
							CoreArgIds.Entity,
							Options
						>
					).Entity.convertEntity as CoreArgConverter<
						CoreEntityArg<SourceOptions>,
						CoreEntityArg<TargetOptions>,
						CoreArgIds.Entity,
						SourceOptions,
						TargetOptions,
						CoreEntityArgParentIds
					>,
					childId: CoreArgIds.Entity,
					id: CoreArgIds.Cell,
					meta,
					sourceOptions,
					targetOptions
				})
			);

			// Return
			return targetCell;
		}
	}

	// Inject static
	computedClassInjectPerClass({
		Base: Cell,
		members,
		// Nothing required
		parameters: []
	});

	// Have to re-inject dynamic bits from generic parents
	return Cell as ReturnClass;
}
