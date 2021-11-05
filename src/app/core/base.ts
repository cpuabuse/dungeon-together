/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for custom prototype chain.
 */

import { CoreUniverse } from "./universe";

/**
 * Non-recursive minimal outline for base instance.
 *
 * @see {@link CoreBaseClassNonRecursive} for more information
 */
export interface CoreBaseNonRecursive {
	/**
	 * A universe instance.
	 *
	 * Unknown chosen over any, not to allow assignments.
	 */
	universe: unknown;
}

/**
 * To merge with base prototype implementation.
 */
export interface CoreBase extends CoreBaseNonRecursive {
	/**
	 * A universe instance.
	 */
	universe: CoreUniverse;
}

/**
 * Non-recursive class type for core base.
 *
 * **Class**
 *
 * When used in factories as `C extends CoreBaseClassNonRecursive`, generic `C` must be extending {@link CoreBase}, even though `C` is only vaguely constrained by {@link CoreBaseClassNonRecursive}, the {@link CoreBase} information should be inserted by casting, when necessary.
 * SGCE core classes should be extending this, as they should be able to have access universe.
 *
 * **Instance**
 *
 * SGCE classes, extend base, which contains SGCE classes. This is a primary recursion.
 * When the client/server SGCE extend class, produced by core SGCE base factory, the generic constrains of that factory (e.g. `C extends CoreBaseClassNonRecursive`), would create an additional recursive loop, if {@link CoreBaseNonRecursive} was recursive (which would not be resolved by the compiler).
 * Thus, {@link CoreBaseNonRecursive}'s universe is `unknown`, so that only recursion that happens, is the primary recursion.
 * To summarize, core factory generic parameter can extend only non-recursive base. {@link CoreBaseNonRecursive} provides at least some type constraints.
 */
export interface CoreBaseClassNonRecursive {
	new (...args: any[]): CoreBaseNonRecursive;
}

/**
 * Class type for core base.
 */
export interface CoreBaseClass {
	new (...args: any[]): CoreBase;
}
