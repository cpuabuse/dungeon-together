/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Args container
 */

import {
	CoreArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsUnion,
	CoreArgsWithMapContainerArg,
	CoreArgsWithoutMapContainerArg
} from ".";

/**
 * Definition of core args container.
 *
 * Container receives info on parent via `U`.
 */
export type CoreArgsContainer<
	U extends CoreArg<I, O>,
	I extends CoreArgIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgOptionsUnion
> = {
	/**
	 * Child universe objects.
	 */
	[K in CoreArgObjectWords[I]["pluralLowercaseWord"] as K]: O[CoreArgOptionIds.Map] extends true
		? CoreArgsWithMapContainerArg<U, I, O>
		: CoreArgsWithoutMapContainerArg<U, I, O>;
};
