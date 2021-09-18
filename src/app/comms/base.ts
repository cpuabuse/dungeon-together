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
