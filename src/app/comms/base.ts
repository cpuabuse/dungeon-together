/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for custom prototype chain.
 */

import { CoreUniverse } from "./universe";

/**
 * Class type for core base.
 */
export interface CoreBaseClass {
	new (...args: any[]): {
		/**
		 * A universe instance.
		 */
		universe: CoreUniverse;
	};
}

/**
 * To merge with base prototype implementation.
 */
export type CoreBase = InstanceType<CoreBaseClass>;
