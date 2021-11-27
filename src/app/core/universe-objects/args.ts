/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptions, CoreArgsOptionsUnion } from "../args";
import { CoreCellArgs } from "../cell";
import { CoreEntityArgs } from "../entity";
import { CoreGridArgs } from "../grid";
import { CoreShardArgs } from "../shard";
import { CoreUniverseObjectPath } from "./path";
import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * @file Core args
 */

/**
 * Generic outline of how universe objects args should look like.
 * Type to check exhaustiveness.
 */
type CoreUniverseObjectArgsIndexDefinitions<
	T extends {
		[K in CoreUniverseObjectIds as K]: CoreUniverseObjectPath<K> & Record<string, any>;
	}
> = T;

/**
 * A non-exhaustive type indexing IDs to args.
 */
type CoreUniverseObjectArgsIndexNonExhaustive<O extends CoreArgsOptionsUnion> = {
	[K in CoreUniverseObjectIds.Shard as K]: CoreShardArgs<O>;
} & {
	[K in CoreUniverseObjectIds.Grid as K]: CoreGridArgs<O>;
} & {
	[K in CoreUniverseObjectIds.Cell as K]: CoreCellArgs<O>;
} & {
	[K in CoreUniverseObjectIds.Entity as K]: CoreEntityArgs<O>;
};

/**
 *  Exhaustive type indexing IDs to args.
 */
export type CoreUniverseObjectArgsIndex<O extends CoreArgsOptionsUnion> = CoreUniverseObjectArgsIndexDefinitions<
	CoreUniverseObjectArgsIndexNonExhaustive<O>
>;

/**
 * The type of the universe objects property in universe object args container.
 */
export type CoreUniverseObjectArgsContainerMemberUniverseObjects<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = O[CoreArgsIds.Map] extends true
	? Map<Uuid, CoreUniverseObjectArgsIndex<O>[I]>
	: Array<CoreUniverseObjectArgsIndex<O>[I]>;

/**
 * Core universe object container args.
 */
export type CoreUniverseObjectArgsContainer<I extends CoreUniverseObjectIds, O extends CoreArgsOptionsUnion> = {
	/**
	 * Child universe objects.
	 */
	[K in CoreUniverseObjectWords[I]["pluralLowercaseWord"] as K]: CoreUniverseObjectArgsContainerMemberUniverseObjects<
		I,
		O
	>;
};
