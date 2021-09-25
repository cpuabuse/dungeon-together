/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file UUID search functionality
 */

import { CoreCell } from "../comms/cell";
import { CoreEntity, EntityPath } from "../comms/entity";
import { CoreGrid } from "../comms/grid";
import { CoreShard } from "../comms/shard";
import { CoreUniverseClassAbstractStatic } from "../comms/universe";
import { Uuid } from "./uuid";

/**
 * Ability to search by UUID in a universe.
 *
 * @returns Generated class
 */
// Factory needs inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseUuidSearchFactory<C extends CoreUniverseClassAbstractStatic>({
	Base
}: {
	/**
	 * Core universe.
	 */
	Base: C;
}) {
	/**
	 * Requirements to search for SGCEs by UUID.
	 */
	abstract class CoreUniverseUuidSearch extends Base {
		/**
		 * Indexing for cells.
		 */
		public abstract cellsIndex: Map<Uuid, CoreCell>;

		/**
		 * Indexed path to a default entity.
		 */
		public abstract defaultEntityPath: EntityPath;

		/**
		 * Indexing for entities.
		 */
		public abstract entitiesIndex: Map<Uuid, CoreEntity>;

		/**
		 * Indexing for grids.
		 */
		public abstract gridsIndex: Map<Uuid, CoreGrid>;

		/**
		 * Indexing for shards.
		 */
		public abstract shardsIndex: Map<Uuid, CoreShard>;

		/**
		 * Gets a cell by UUID.
		 *
		 * @returns The cell, or default cell if not found
		 */
		public getEntityByUuid({
			entityUuid
		}: {
			/**
			 * Entity UUID.
			 */
			entityUuid: Uuid;
		}): this["entitiesIndex"] extends Map<Uuid, infer T> ? T : never {
			// Casting since somehow inference throws error with polymorphic this
			let entity: (this["entitiesIndex"] extends Map<Uuid, infer T> ? T : never) | undefined = this.entitiesIndex.get(
				entityUuid
			) as (this["entitiesIndex"] extends Map<Uuid, infer T> ? T : never) | undefined;
			if (entity === undefined) {
				// Casting since somehow inference throws error with polymorphic this
				return this.getEntity(this.defaultEntityPath) as this["entitiesIndex"] extends Map<Uuid, infer T> ? T : never;
			}
			return entity;
		}
	}

	// Return class
	return CoreUniverseUuidSearch;
}
