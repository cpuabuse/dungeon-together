/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptions, CoreArgsOptionsUnion } from "../args";
import { CoreUniverseObjectPath } from "./path";
import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * @file Core args
 */

/**
 * Generic outline of how universe objects args should look like.
 */
export type CoreUniverseObjectArgs<I extends CoreUniverseObjectIds> = CoreUniverseObjectPath<I> & Record<string, any>;

/**
 * The type of the universe objects property in universe object args container.
 */
export type CoreUniverseObjectArgsContainerMemberUniverseObjects<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion,
	A extends CoreUniverseObjectArgs<I>
> = O[CoreArgsIds.Map] extends true ? Map<Uuid, A> : Array<A>;

/**
 * Core universe object container args.
 */
export type CoreUniverseObjectArgsContainer<
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion,
	A extends CoreUniverseObjectArgs<I>
> = {
	/**
	 * Child universe objects.
	 */
	[K in CoreUniverseObjectWords[I]["pluralLowercaseWord"] as K]: CoreUniverseObjectArgsContainerMemberUniverseObjects<
		I,
		O,
		A
	>;
};
