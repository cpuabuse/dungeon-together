/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptionsUnion, CoreArgsOptionsUnionGenerate } from "../args";
import { CoreUniverseObjectArgsIndex, CoreUniverseObjectArgsIndexAccess } from "../args-index";

import { CoreUniverseObjectPath } from "./path";
import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * Args options constraint for core universe objects.
 */
export type CoreUniverseObjectArgsOptionsUnion = CoreArgsOptionsUnionGenerate<CoreArgsIds.Map>;

/**
 * Generic outline of how universe objects args should look like.
 */
export type CoreUniverseObjectArgs<
	I extends CoreUniverseObjectIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgsOptionsUnion
> = CoreUniverseObjectPath<I>;

/**
 * The type of the universe objects property in universe object args container with map.
 */
export type CoreUniverseObjectArgsContainerMemberUniverseObjectsWithMap<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = Map<Uuid, CoreUniverseObjectArgsIndexAccess<CoreUniverseObjectArgsIndex<O>, I, O>>;

/**
 * The type of the universe objects property in universe object args container without map.
 */
export type CoreUniverseObjectArgsContainerMemberUniverseObjectsWithoutMap<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = Array<CoreUniverseObjectArgsIndexAccess<CoreUniverseObjectArgsIndex<O>, I, O>>;

/**
 * Core universe object container args.
 */
export type CoreUniverseObjectArgsContainer<I extends CoreUniverseObjectIds, O extends CoreArgsOptionsUnion> = {
	/**
	 * Child universe objects.
	 */
	[K in CoreUniverseObjectWords[I]["pluralLowercaseWord"] as K]: O[CoreArgsIds.Map] extends true
		? CoreUniverseObjectArgsContainerMemberUniverseObjectsWithMap<I, O>
		: CoreUniverseObjectArgsContainerMemberUniverseObjectsWithoutMap<I, O>;
};
