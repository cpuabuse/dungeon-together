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
	CoreArgOptionsUnion,
	CoreArgOptionsWithMapUnion,
	CoreArgsWithMapContainerArg,
	CoreArgsWithoutMapContainerArg
} from ".";

/**
 * Definition of core args container.
 *
 * @typeParam Arg - Arg to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreArgsContainer<
	Arg extends CoreArg<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = {
	/**
	 * Child universe objects.
	 */
	// ``${K}`` used over `K` is important in TS 4.6, as it gives slightly different types
	[K in CoreArgObjectWords[ChildId]["pluralLowercaseWord"] as `${K}`]: Options extends CoreArgOptionsWithMapUnion
		? CoreArgsWithMapContainerArg<Arg, ChildId, Options, ParentIds>
		: CoreArgsWithoutMapContainerArg<Arg, ChildId, Options, ParentIds>;
};
