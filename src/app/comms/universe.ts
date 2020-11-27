/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shared universe.
 */

import { CellPath, CommsCell } from "./cell";
import { CommsEntity, EntityPath } from "./entity";
import { CommsGrid, GridPath } from "./grid";
import { CommsShard, CommsShardArgs, ShardPath } from "./shard";
import { Uuid } from "../common/uuid";

/**
 * Lets other objects become [[Poolable]].
 */
export interface CommsUniverse {
	/**
	 * Actual shards here.
	 */
	shards: Map<Uuid, CommsShard>;

	/**
	 * Add shard to universe.
	 * @returns `true` on success, `false` on failure
	 */
	addShard(shard: CommsShardArgs): void;

	/**
	 * Gets the shard.
	 */
	getShard(path: ShardPath): CommsShard;

	/**
	 * Gets the [[CommsCell]].
	 */
	getCell(path: CellPath): CommsCell;

	/**
	 * Gets the grid.
	 */
	getGrid(path: GridPath): CommsGrid;

	/**
	 * Gets the [[CommsEntity]].
	 */
	getEntity(path: EntityPath): CommsEntity;

	/**
	 * Remove shard from universe.
	 */
	removeShard(CommsShard: ShardPath): void;
}
