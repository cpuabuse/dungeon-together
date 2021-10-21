/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cell.
 */

import { defaultGridUuid, defaultShardUuid, entityUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { Vector } from "../common/vector";
import { CoreArgsIds, CoreArgsIdsToOptions, CoreArgsOptionsUnion } from "./args";
import { CoreBaseClass, CoreBaseClassNonRecursive } from "./base";
import {
	CommsEntity,
	CommsEntityArgs,
	CommsEntityRaw,
	CoreEntity,
	CoreEntityArgs,
	EntityPath,
	commsEntityRawToArgs,
	coreEntityArgsConvert
} from "./entity";
import { GridPath } from "./grid";

/**
 * A location-like.
 */
export interface CommsCellArgs extends CellPath, Vector {
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
		 *
		 */
		entities: Array<CommsEntityRaw>;

		/**
		 *
		 */
		worlds?: Array<Uuid>;
	},
	Vector
>;

/**
 * Core cell args.
 *
 * If any changes are made, they should be reflected in {@link coreArgsConvert}.
 */
export type CoreCellArgs<O extends CoreArgsOptionsUnion> = (O[CoreArgsIds.Path] extends true ? CellPath : CellOwnPath) &
	(O[CoreArgsIds.Vector] extends true ? Vector : unknown) & {
		/**
		 * Array of entities.
		 */
		entities: O[CoreArgsIds.Map] extends true ? Map<Uuid, CoreEntityArgs<O>> : Array<CoreEntityArgs<O>>;

		/**
		 * Worlds.
		 */
		worlds: O[CoreArgsIds.Map] extends true ? Set<Uuid> : Array<Uuid>;
	};

/**
 * Typeof class for cells.
 */
export type CoreCellClass = {
	/**
	 *
	 */
	new (...args: any[]): CommsCell;
};

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
	getEntity(path: EntityPath): CommsEntity;

	/**
	 * Removes [[Entity]].
	 */
	removeEntity(path: EntityPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Core cell.
 */
export type CoreCell = CommsCell & InstanceType<ReturnType<typeof CoreCellFactory>>;

/**
 * Factory for core cell.
 *
 * @see {@link CoreBaseClassNonRecursive} for usage
 *
 * @returns Cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreCellFactory<C extends CoreBaseClassNonRecursive = CoreBaseClass>({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: C;
}) {
	/**
	 * Core cell base class.
	 */
	// Merging interfaces
	// eslint-disable-next-line no-redeclare
	abstract class CoreCell extends Base {
		/**
		 * Entities.
		 */
		abstract readonly entities: Map<Uuid, CoreEntity>;

		/**
		 * Gets default entity UUID.
		 *
		 * @returns Default entity UUID
		 */
		public static getDefaultEntityUuid({ cellUuid }: Pick<CellPath, "cellUuid">): Uuid {
			return getDefaultUuid({
				path: `${entityUuidUrlPath}${urlPathSeparator}${cellUuid}`
			});
		}

		/**
		 * Attach {@link CoreEntity} to {@link CoreCell}.
		 *
		 * @param entity - {@link CoreEntity}, anything that resides within a cell
		 */
		public attach(entity: CoreEntity): void {
			this.entities.set(entity.entityUuid, entity);
		}

		/**
		 * Detach {@link CoreEntity} from {@link CoreCell}.
		 *
		 * @returns If deletion was successful or not
		 */
		public detach({ entityUuid }: CoreEntity): boolean {
			if (this.entities.has(entityUuid)) {
				this.entities.delete(entityUuid);
				return true;
			}
			return false;
		}
	}

	return CoreCell;
}

/**
 * Cell own path.
 */
export interface CellOwnPath extends GridPath {
	/**
	 * Cell uuid.
	 */
	cellUuid: Uuid;
}

/**
 * Way to get to cell.
 */
export interface CellPath extends GridPath, CellOwnPath {}

/**
 * Converts [[CommsCellRaw]] to [[CommsCellArgs]].
 *
 * @param rawSource
 * @param path
 * @param rawSource
 * @param path
 */
export function commsCellRawToArgs(rawSource: CommsCellRaw, path: CellPath): CommsCellArgs {
	return {
		...path,
		cellUuid: rawSource.cellUuid,
		entities: new Map(
			rawSource.entities.map(function (entity) {
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

/**
 * Convert cell args between options.
 *
 * Has to strictly follow {@link CoreCellArgs}.
 *
 * @returns Converted cell args
 */
export function coreCellArgsConvert<S extends CoreArgsOptionsUnion, T extends CoreArgsOptionsUnion>({
	cell,
	sourceOptions,
	targetOptions
}: {
	/**
	 * Core cell args.
	 */
	cell: CoreCellArgs<S>;

	/**
	 * Option for the source.
	 */
	sourceOptions: S;

	/**
	 * Option for the target.
	 */
	targetOptions: T;
}): CoreCellArgs<T> {
	// Define source and result, with minimal options
	const sourceCell: CoreCellArgs<S> = cell;
	const sourceCellAs: Record<string, any> = sourceCell;
	// Cannot assign to conditional type without casting
	let targetCell: CoreCellArgs<T> = {
		cellUuid: sourceCell.cellUuid
	} as CoreCellArgs<T>;
	let targetCellAs: Record<string, any> = targetCell;

	// Path
	if (targetOptions[CoreArgsIds.Path] === true) {
		/**
		 * Core cell args with path.
		 */
		type CoreCellArgsWithPath = CoreCellArgs<CoreArgsIdsToOptions<CoreArgsIds.Path>>;
		let targetCellWithPath: CoreCellArgsWithPath = targetCellAs as CoreCellArgsWithPath;

		if (sourceOptions[CoreArgsIds.Path] === true) {
			// Source to target
			const sourceCellWithPath: CoreCellArgsWithPath = sourceCellAs as CoreCellArgsWithPath;
			targetCellWithPath.shardUuid = sourceCellWithPath.shardUuid;
			targetCellWithPath.gridUuid = sourceCellWithPath.gridUuid;
		} else {
			// Default to target
			targetCellWithPath.shardUuid = defaultShardUuid;
			targetCellWithPath.gridUuid = defaultGridUuid;
		}
	}

	// Vector
	if (targetOptions[CoreArgsIds.Vector] === true) {
		/**
		 * Core cell args with vector.
		 */
		type CoreCellArgsWithVector = CoreCellArgs<CoreArgsIdsToOptions<CoreArgsIds.Vector>>;
		let targetCellWithVector: CoreCellArgsWithVector = targetCellAs as CoreCellArgsWithVector;

		if (sourceOptions[CoreArgsIds.Vector] === true) {
			// Source to target
			const sourceCellWithVector: CoreCellArgsWithVector = sourceCellAs as CoreCellArgsWithVector;
			targetCellWithVector.x = sourceCellWithVector.x;
			targetCellWithVector.y = sourceCellWithVector.y;
			targetCellWithVector.z = sourceCellWithVector.z;
		} else {
			// Default to target
			targetCellWithVector.x = 0;
			targetCellWithVector.y = 0;
			targetCellWithVector.z = 0;
		}
	}

	/**
	 * Core cell args with map.
	 */
	type CoreCellArgsWithMap = CoreCellArgs<CoreArgsIdsToOptions<CoreArgsIds.Map>>;

	/**
	 * Core cell args without map.
	 */
	type CoreCellArgsWithoutMap = CoreCellArgs<CoreArgsIdsToOptions<never>>;

	// Map
	if (targetOptions[CoreArgsIds.Map] === true) {
		let targetCellWithMap: CoreCellArgsWithMap = targetCellAs as CoreCellArgsWithMap;

		// Worlds
		targetCellWithMap.worlds = new Set(sourceCell.worlds);

		if (sourceOptions[CoreArgsIds.Map] === true) {
			// Map to map
			const sourceCellWithMap: CoreCellArgsWithMap = sourceCellAs as CoreCellArgsWithMap;

			// Entities
			targetCellWithMap.entities = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(sourceCellWithMap.entities, ([uuid, entityWithMap]) =>
					// Revert back to original type, so that can be used on generics with "S" and "T" types
					[uuid, coreEntityArgsConvert({ entity: entityWithMap as CoreEntityArgs<S>, sourceOptions, targetOptions })]
				)
			);
		} else {
			// Array to map
			const sourceCellWithoutMap: CoreCellArgsWithoutMap = sourceCellAs as CoreCellArgsWithoutMap;

			// Entities
			targetCellWithMap.entities = new Map(
				sourceCellWithoutMap.entities.map(entityWithoutMap => [
					entityWithoutMap.entityUuid,
					// Revert back to original type, so that can be used on generics with "S" and "T" types
					coreEntityArgsConvert({ entity: entityWithoutMap as CoreEntityArgs<S>, sourceOptions, targetOptions })
				])
			);
		}
	} else {
		let targetCellWithoutMap: CoreCellArgsWithoutMap = sourceCellAs as CoreCellArgsWithoutMap;

		// Worlds
		targetCellWithoutMap.worlds = Array.from(sourceCell.worlds);

		if (sourceOptions[CoreArgsIds.Map] === true) {
			// Map to array
			const sourceCellWithMap: CoreCellArgsWithMap = sourceCellAs as CoreCellArgsWithMap;

			// Entities
			// Argument types correctly inferred from "Array.from()", and UUID is unused, probably eslint bug
			// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
			targetCellWithoutMap.entities = Array.from(sourceCellWithMap.entities, ([uuid, entityWithMap]) =>
				// Revert back to original type, so that can be used on generics with "S" and "T" types
				coreEntityArgsConvert({ entity: entityWithMap as CoreEntityArgs<S>, sourceOptions, targetOptions })
			);
		} else {
			// Array to array
			const sourceCellWithoutMap: CoreCellArgsWithoutMap = sourceCellAs as CoreCellArgsWithoutMap;

			// Entities
			targetCellWithoutMap.entities = sourceCellWithoutMap.entities.map(entityWithoutMap =>
				coreEntityArgsConvert({ entity: entityWithoutMap as CoreEntityArgs<S>, sourceOptions, targetOptions })
			);
		}
	}
	// Return
	return targetCell;
}
