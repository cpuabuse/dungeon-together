/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import { Uuid } from "../../common/uuid";
import { CoreArgObjectWords, CoreArgOptionIds, CoreArgOptionsUnion, CoreArgPath } from ".";

/**
 * Identifiers for a universe objects' members.
 * Should be in singular lowercase form.
 */
export enum CoreArgIds {
	Shard = "shard",
	Grid = "grid",
	Cell = "cell",
	Entity = "entity"
}

/**
 * Definition of core args.
 */
export type CoreArg<
	I extends CoreArgIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgOptionsUnion
> = CoreArgPath<I>;

/**
 * The type of the universe objects property in universe object args container with map.
 */
export type CoreArgsContainerMemberArgsWithMap<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Map<Uuid, N>;

/**
 * The type of the universe objects property in universe object args container without map.
 */
export type CoreArgsContainerMemberArgsWithoutMap<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Array<N>;

/**
 * Definition of core args container.
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
		? CoreArgsContainerMemberArgsWithMap<U, I, O>
		: CoreArgsContainerMemberArgsWithoutMap<U, I, O>;
};
