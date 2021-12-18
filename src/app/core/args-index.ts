/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args index
 */

import { CoreArgsOptionsUnion } from "./args";
import { CoreCellArgs } from "./cell";
import { CoreEntityArgs } from "./entity";
import { CoreGridArgs } from "./grid";
import { CoreShardArgs } from "./shard";
import { CoreUniverseObjectArgs, CoreUniverseObjectIds } from "./universe-object";

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
