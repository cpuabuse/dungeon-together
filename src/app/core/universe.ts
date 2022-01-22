/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core universe.
 */

import { Application } from "./application";
import { CoreBaseClass } from "./base";
import { CellPathExtended, CoreCell, CoreCellClass } from "./cell";
import { CommsEntity, CoreEntityClass, EntityPathExtended } from "./entity";
import { CommsGrid, CoreGridClass, GridPath } from "./grid";
import { CommsShard, CommsShardArgs, CoreShardClass, ShardPath } from "./shard";

/**
 * Core universe class.
 *
 * Must remain statically typed, without use of mixins, for appropriate type recursions.
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
	 * Application.
	 */
	public application: Application;

	/**
	 * Base object class.
	 */
	protected abstract readonly Base: CoreBaseClass;

	/**
	 * Constructs the universe core.
	 *
	 * @param param
	 */
	public constructor({
		application
	}: {
		/**
		 * App this is added to.
		 */
		application: Application;
	}) {
		this.application = application;
	}

	/**
	 * Add shard to universe.
	 *
	 * @returns `true` on success, `false` on failure
	 */
	public abstract addShard(shard: CommsShardArgs): void;

	/**
	 * Gets the [[CommsCell]].
	 */
	public abstract getCell(path: CellPathExtended): CoreCell;

	/**
	 * Gets the [[CommsEntity]].
	 */
	public abstract getEntity(path: EntityPathExtended): CommsEntity;

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

/**
 * Classes extending core universe to have the constructor signature.
 */
export interface CoreUniverseArgs {
	/**
	 * App with state.
	 */
	application: Application;
}

/**
 * Original abstract class type for core universe.
 */
export type CoreUniverseClassOriginalAbstract = typeof CoreUniverse;

/**
 * Class type for classes extending core universe.
 */
export interface CoreUniverseClassConcreteStatic<U extends CoreUniverse = CoreUniverse> {
	new (...args: any[]): U;
}

/**
 * Class type for abstract classes, like {@link CoreUniverse}, to be used in mixin to generate the final core universe functionality.
 * In this type, arguments are `any`.
 */
export type CoreUniverseClassAbstractStatic<U extends CoreUniverse = CoreUniverse> = abstract new (...args: any[]) => U;
