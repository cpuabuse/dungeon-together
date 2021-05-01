/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shared universe.
 */

import { Uuid } from "../common/uuid";
import { CellPath, CommsCell } from "./cell";
import { CommsConnection } from "./connection";
import { CommsEntity, EntityPath } from "./entity";
import { CommsGrid, GridPath } from "./grid";
import { CommsShard, CommsShardArgs, ShardPath } from "./shard";

/**
 * Lets other objects become [[CommsProto]].
 */
export interface CommsUniverse {
	/**
	 * Actual shards here.
	 */
	shards: Map<Uuid, CommsShard>;

	/**
	 * Universe connections.
	 */
	connections: Set<CommsConnection>;

	/**
	 * Adds a connection
	 */
	addConnection(connectionArgs: CommsConnection): CommsConnection;

	/**
	 * Add shard to universe.
	 *
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
