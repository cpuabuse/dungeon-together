/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for custom prototype chain.
 */

import { CoreCellClass } from "./cell";
import { CoreEntityClass } from "./entity";
import { CoreUniverse } from "./universe";
import { CoreUniverseObjectArgsOptionsUnion } from "./universe-object";

/**
 * Non-recursive minimal outline for base instance.
 *
 * @see {@link CoreBaseClassNonRecursive} for more information
 */
export interface CoreBaseNonRecursiveInstance {
	/**
	 * A universe instance.
	 *
	 * Unknown chosen over any, not to allow assignments.
	 */
	universe: unknown;
}

/**
 * Static part of {@link CoreBaseClassNonRecursive}.
 */
export type CoreBaseNonRecursiveStatic = object;

/**
 * Constructor parameters of {@link CoreBaseClassNonRecursive}.
 */
export type CoreBaseNonRecursiveParameters = any[];

/**
 * To merge with base prototype implementation.
 */
export interface CoreBase<
	Options extends CoreUniverseObjectArgsOptionsUnion,
	CellClass extends CoreCellClass<Options> = CoreCellClass<Options>,
	EntityClass extends CoreEntityClass<Options> = CoreEntityClass<Options>
> extends CoreBaseNonRecursiveInstance {
	/**
	 * A universe instance.
	 */
	universe: CoreUniverse<Options, CellClass, EntityClass>;
}

/**
 * Non-recursive class type for core base.
 *
 * **Class**
 *
 * When used in factories as `C extends CoreBaseClassNonRecursive`, generic `C` must be extending {@link CoreBaseClassNonRecursive}, even though `C` is only vaguely constrained by {@link CoreBaseClassNonRecursive}, the {@link CoreBase} information should be inserted by casting, when necessary.
 * Core universe object classes should be extending this, as they should be able to have access universe.
 *
 * **Instance**
 *
 * Core universe object classes, extend base, which contains core universe object classes. This is a primary recursion.
 * When the client/server core universe objects extend class, produced by core universe object base factory, the generic constrains of that factory (e.g. `C extends CoreBaseClassNonRecursive`), would create an additional recursive loop, if {@link CoreBaseNonRecursiveInstance} was recursive (which would not be resolved by the compiler).
 * Thus, {@link CoreBaseNonRecursiveInstance}'s universe is `unknown`, so that only recursion that happens, is the primary recursion.
 *
 * To summarize, core factory generic parameter can extend only non-recursive base. {@link CoreBaseNonRecursiveInstance} provides at least some type constraints.
 */
export interface CoreBaseClassNonRecursive {
	new (...args: any[]): CoreBaseNonRecursiveInstance;
}

/**
 * Class type for core base.
 */
export interface CoreBaseClass<Options extends CoreUniverseObjectArgsOptionsUnion> {
	new (...args: any[]): CoreBase<Options>;
}
