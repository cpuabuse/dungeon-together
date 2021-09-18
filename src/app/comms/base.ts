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
 * Client/server entity/cell/grid/shard classes, extend core base, which contains core universe. Core universe contains core entity/cell/grid/shard classes, which also extend core base. This creates a primary recursion.
 * When the client/server entity/cell/grid/shard extends the core base factory produced class, within generic constrains of that factory (e.g. `C extends CoreBaseClassNonRecursive`), if the universe in this interface were to be a core universe, it would create an additional recursive loop, which would not be resolved by the compiler. Thus, the type constraints should be using this, more vague interface, where universe is `any`, so that only recursion that happens, is the primary recursion.
 */
export interface CoreBaseNonRecursive {
	/**
	 * A universe instance.
	 */
	universe: any;
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
 */
export interface CoreBaseClassNonRecursive {
	new (...args: any[]): CoreBaseNonRecursive;
}

/**
 * Class type for core base.
 */
export interface CoreBaseClass extends CoreBaseClassNonRecursive {
	new (...args: any[]): CoreBase;
}
