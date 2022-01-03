/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptionsUnion } from "../args";
import { CoreUniverseObjectIds } from "../universe-object";
import { CoreUniverseObjectPath } from "../universe-object/path";
import { CoreUniverseObjectWords } from "../universe-object/words";

/**
 * @file Core args
 */

/**
 *
 */
export type CoreArgs<
	I extends CoreUniverseObjectIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgsOptionsUnion
> = CoreUniverseObjectPath<I>;

/**
 * The type of the universe objects property in universe object args container with map.
 */
export type CoreArgsContainerMemberUniverseObjectsWithMap<
	N extends CoreArgs<I, O>,
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = Map<Uuid, N>;

/**
 * The type of the universe objects property in universe object args container without map.
 */
export type CoreArgsContainerMemberUniverseObjectsWithoutMap<
	N extends CoreArgs<I, O>,
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = Array<N>;

/**
 *
 */
export type CoreArgsContainer<
	N extends CoreArgs<I, O>,
	I extends CoreUniverseObjectIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgsOptionsUnion
> = {
	/**
	 * Child universe objects.
	 */
	[K in CoreUniverseObjectWords[I]["pluralLowercaseWord"] as K]: O[CoreArgsIds.Map] extends true
		? CoreArgsContainerMemberUniverseObjectsWithMap<N, I, O>
		: CoreArgsContainerMemberUniverseObjectsWithoutMap<N, I, O>;
};
