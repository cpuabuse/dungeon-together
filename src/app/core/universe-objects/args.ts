/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptionsUnion } from "../args";
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
 */
type CoreUniverseObjectArgs<
	I extends CoreUniverseObjectIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	O extends CoreArgsOptionsUnion
> = CoreUniverseObjectPath<I>;

/**
 * A non-exhaustive type indexing IDs to args.
 */
type CoreUniverseObjectArgsIndexNonExhaustive<O extends CoreArgsOptionsUnion> = {
	/**
	 * Core shard args.
	 */
	[CoreUniverseObjectIds.Shard]: CoreShardArgs<O>;

	/**
	 * Core grid args.
	 */
	[CoreUniverseObjectIds.Grid]: CoreGridArgs<O>;

	/**
	 * Core cell args.
	 */
	[CoreUniverseObjectIds.Cell]: CoreCellArgs<O>;

	/**
	 * Core entity args.
	 */
	[CoreUniverseObjectIds.Entity]: CoreEntityArgs<O>;
};

/**
 *  Exhaustive type indexing IDs to args.
 */
export type CoreUniverseObjectArgsIndex<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = CoreUniverseObjectArgsIndexNonExhaustive<O>[I] extends CoreUniverseObjectArgs<I, O>
	? CoreUniverseObjectArgsIndexNonExhaustive<O>[I]
	: never;

/**
 * The type of the universe objects property in universe object args container.
 */
export type CoreUniverseObjectArgsContainerMemberUniverseObjects<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = O[CoreArgsIds.Map] extends true
	? Map<Uuid, CoreUniverseObjectArgsIndex<I, O>>
	: Array<CoreUniverseObjectArgsIndex<I, O>>;

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
