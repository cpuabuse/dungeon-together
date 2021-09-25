/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cell.
 */

import { entityUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { Vector } from "../common/vector";
import { CoreBase, CoreBaseClassNonRecursive } from "./base";
import { CommsEntity, CommsEntityArgs, CommsEntityRaw, CoreEntity, EntityPath, commsEntityRawToArgs } from "./entity";
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
	 * Worlds
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
export type CoreCell = CommsCell;

/**
 * Factory for core cell.
 *
 * @see {@link CoreBaseClassNonRecursive} for usage
 *
 * @returns Cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreCellFactory<C extends CoreBaseClassNonRecursive>({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: C;
}) {
	/**
	 * Add back the manually verified information about base from argument, extending core base.
	 *
	 * @see {@link CoreBaseClassNonRecursive} for reasons of interface merging
	 */
	// eslint-disable-next-line no-redeclare, @typescript-eslint/no-empty-interface
	interface Base extends CoreBase {}

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
 * Way to get to cell.
 */
export interface CellPath extends GridPath {
	/**
	 * Cell uuid.
	 */
	cellUuid: Uuid;
}

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
