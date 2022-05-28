/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core universe.
 */

import { Application } from "./application";
import { CoreArgIds, CoreArgPath } from "./arg";
import { CoreBaseClassNonRecursive } from "./base";
import {
	CoreCellArg,
	CoreCellArgGrandparentIds,
	CoreCellArgParentId,
	CoreCellArgParentIds,
	CoreCellClass,
	CoreCellInstance
} from "./cell";
import {
	CoreEntityArg,
	CoreEntityArgGrandparentIds,
	CoreEntityArgParentId,
	CoreEntityArgParentIds,
	CoreEntityClass,
	CoreEntityInstance
} from "./entity";
import {
	CoreGridArg,
	CoreGridArgGrandparentIds,
	CoreGridArgParentId,
	CoreGridArgParentIds,
	CoreGridClass,
	CoreGridInstance
} from "./grid";
import {
	CoreShardArg,
	CoreShardArgGrandparentIds,
	CoreShardArgParentId,
	CoreShardArgParentIds,
	CoreShardClass,
	CoreShardInstance
} from "./shard";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectUniverse } from "./universe-object";

/**
 * Core universe class.
 *
 * Must remain statically typed, without use of mixins, for appropriate type recursions.
 */
export abstract class CoreUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Entity extends CoreEntityInstance<BaseClass, Options> = CoreEntityInstance<BaseClass, Options>,
	Cell extends CoreCellInstance<BaseClass, Options, Entity> = CoreCellInstance<BaseClass, Options, Entity>,
	Grid extends CoreGridInstance<BaseClass, Options, Cell> = CoreGridInstance<BaseClass, Options, Cell>,
	Shard extends CoreShardInstance<BaseClass, Options, Grid> = CoreShardInstance<BaseClass, Options, Grid>
> implements
		CoreUniverseObjectUniverse<
			BaseClass,
			Entity,
			CoreEntityArg<Options>,
			CoreArgIds.Entity,
			Options,
			CoreEntityArgParentId,
			CoreEntityArgGrandparentIds
		>,
		CoreUniverseObjectUniverse<
			BaseClass,
			Cell,
			CoreCellArg<Options>,
			CoreArgIds.Cell,
			Options,
			CoreCellArgParentId,
			CoreCellArgGrandparentIds,
			Entity,
			CoreEntityArg<Options>,
			CoreArgIds.Entity
		>,
		CoreUniverseObjectUniverse<
			BaseClass,
			Grid,
			CoreGridArg<Options>,
			CoreArgIds.Grid,
			Options,
			CoreGridArgParentId,
			CoreGridArgGrandparentIds,
			Cell,
			CoreCellArg<Options>,
			CoreArgIds.Cell
		>,
		CoreUniverseObjectUniverse<
			BaseClass,
			Shard,
			CoreShardArg<Options>,
			CoreArgIds.Shard,
			Options,
			CoreShardArgParentId,
			CoreShardArgGrandparentIds,
			Grid,
			CoreGridArg<Options>,
			CoreArgIds.Grid
		>
{
	public abstract Cell: CoreCellClass<BaseClass, Options, Entity, Cell>;

	public abstract Entity: CoreEntityClass<BaseClass, Options, Entity>;

	public abstract Grid: CoreGridClass<BaseClass, Options, Cell, Grid>;

	public abstract Shard: CoreShardClass<BaseClass, Options, Grid, Shard>;

	public abstract getCell(path: CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>): Cell;

	public abstract getEntity(path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>): Entity;

	public abstract getGrid(path: CoreArgPath<CoreArgIds.Grid, Options, CoreGridArgParentIds>): Grid;

	public abstract getShard(path: CoreArgPath<CoreArgIds.Shard, Options, CoreShardArgParentIds>): Shard;
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
