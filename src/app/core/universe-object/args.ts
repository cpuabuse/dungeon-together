/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptionsUnion, CoreArgsOptionsUnionGenerate } from "../args";
import { CoreCellArgs } from "../cell";
import { CoreEntityArgs } from "../entity";
import { CoreGridArgs } from "../grid";
import { CoreShardArgs } from "../shard";
import { CoreUniverseObjectPath } from "./path";
import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * Args options constraint for core universe objects.
 */
export type CoreUniverseObjectArgsOptionsUnion = CoreArgsOptionsUnionGenerate<CoreArgsIds.Map>;

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
 * A non-exhaustive constraint for args index (type indexing IDs to args).
 *
 * @remarks
 * To be used in generic type args, and to define indexes.
 * Use {@link CoreUniverseObjectArgsIndexAccess} to access the args.
 */
export type CoreUniverseObjectArgsIndex<O extends CoreArgsOptionsUnion> = {
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
 * A type safe way to extract IDs from index, especially within a generic type.
 * Performs index exhaustiveness check, and args type constraint check.
 * Asserts that args are args.
 */
export type CoreUniverseObjectArgsIndexAccess<
	N extends CoreUniverseObjectArgsIndex<O>,
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion
> = N[I] extends CoreUniverseObjectArgs<I, O> ? N[I] : never;

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
