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
import { CoreEntityArgParentIds, CoreEntityClass, CoreEntityInstance } from "./entity";
import { CoreUniverseObjectArgsOptionsUnion } from "./universe-object";

/**
 * Core universe class.
 *
 * Must remain statically typed, without use of mixins, for appropriate type recursions.
 */
export abstract class CoreUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	Options extends CoreUniverseObjectArgsOptionsUnion
> {
	public abstract Cell: CoreCellClass<BaseClass, Options>;

	public abstract Entity: CoreEntityClass<BaseClass, Options>;

	public abstract getCell(
		path: CoreArgPath<CoreArgIds.Cell, Options, CoreCellArgParentIds>
	): CoreCellInstance<BaseClass, Options>;

	public abstract getEntity(
		path: CoreArgPath<CoreArgIds.Entity, Options, CoreEntityArgParentIds>
	): CoreEntityInstance<BaseClass, Options>;
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
