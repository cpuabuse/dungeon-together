/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file UUID search functionality
 */

import { CoreCell } from "../core/cell";
import { CoreEntity, EntityPath } from "../core/entity";
import { CoreGrid } from "../core/grid";
import { CoreShard } from "../core/shard";
import { CoreUniverseClassAbstractStatic } from "../core/universe";
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
		public getCellByUuid({
			cellUuid
		}: {
			/**
			 * Cell UUID.
			 */
			cellUuid: Uuid;
		}): this["cellsIndex"] extends Map<Uuid, infer T> ? T : never {
			// Casting since somehow inference throws error with polymorphic this
			let cell: (this["cellsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined = this.cellsIndex.get(
				cellUuid
			) as (this["cellsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined;
			if (cell === undefined) {
				// Casting since somehow inference throws error with polymorphic this
				return this.getCell(this.defaultEntityPath) as this["cellsIndex"] extends Map<Uuid, infer T> ? T : never;
			}
			return cell;
		}

		/**
		 * Gets a entity by UUID.
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

		/**
		 * Gets a grid by UUID.
		 *
		 * @returns The grid, or default grid if not found
		 */
		public getGridByUuid({
			gridUuid
		}: {
			/**
			 * Grid UUID.
			 */
			gridUuid: Uuid;
		}): this["gridsIndex"] extends Map<Uuid, infer T> ? T : never {
			// Casting since somehow inference throws error with polymorphic this
			let grid: (this["gridsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined = this.gridsIndex.get(
				gridUuid
			) as (this["gridsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined;
			if (grid === undefined) {
				// Casting since somehow inference throws error with polymorphic this
				return this.getGrid(this.defaultEntityPath) as this["gridsIndex"] extends Map<Uuid, infer T> ? T : never;
			}
			return grid;
		}

		/**
		 * Gets a shard by UUID.
		 *
		 * @returns The shard, or default shard if not found
		 */
		public getShardByUuid({
			shardUuid
		}: {
			/**
			 * Shard UUID.
			 */
			shardUuid: Uuid;
		}): this["shardsIndex"] extends Map<Uuid, infer T> ? T : never {
			// Casting since somehow inference throws error with polymorphic this
			let shard: (this["shardsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined = this.shardsIndex.get(
				shardUuid
			) as (this["shardsIndex"] extends Map<Uuid, infer T> ? T : never) | undefined;
			if (shard === undefined) {
				// Casting since somehow inference throws error with polymorphic this
				return this.getShard(this.defaultEntityPath) as this["shardsIndex"] extends Map<Uuid, infer T> ? T : never;
			}
			return shard;
		}
	}

	// Return class
	return CoreUniverseUuidSearch;
}
