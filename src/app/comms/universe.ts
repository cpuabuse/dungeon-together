/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core universe.
 */

import { CoreBaseClass } from "./base";
import { CellPath, CommsCell, CoreCellClass } from "./cell";
import { CommsEntity, CoreEntityClass, EntityPath } from "./entity";
import { CommsGrid, CoreGridClass, GridPath } from "./grid";
import { CommsShard, CommsShardArgs, CoreShardClass, ShardPath } from "./shard";

/**
 * Core universe class.
 */
export abstract class CoreUniverse {
	/**
	 * Shard prototype.
	 */
	public abstract readonly Cell: CoreCellClass;

	/**
	 * Shard prototype.
	 */
	public abstract readonly Entity: CoreEntityClass;

	/**
	 * Shard prototype.
	 */
	public abstract readonly Grid: CoreGridClass;

	/**
	 * Shard prototype.
	 */
	public abstract readonly Shard: CoreShardClass;

	/**
	 * Base object class.
	 */
	protected abstract readonly Base: CoreBaseClass;

	/**
	 * Add shard to universe.
	 *
	 * @returns `true` on success, `false` on failure
	 */
	public abstract addShard(shard: CommsShardArgs): void;

	/**
	 * Gets the [[CommsCell]].
	 */
	public abstract getCell(path: CellPath): CommsCell;

	/**
	 * Gets the [[CommsEntity]].
	 */
	public abstract getEntity(path: EntityPath): CommsEntity;

	/**
	 * Gets the grid.
	 */
	public abstract getGrid(path: GridPath): CommsGrid;

	/**
	 * Gets the shard.
	 */
	public abstract getShard(path: ShardPath): CommsShard;

	/**
	 * Remove shard from universe.
	 */
	public abstract removeShard(CommsShard: ShardPath): void;
}
