/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import { CoreArgPath, CoreArgPathNever } from "./path";
import { CoreArgOptionsUnion } from ".";

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
 * Definition of core args with conditional keys for non-generics.
 */
export type CoreArg<
	Id extends CoreArgIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArgPath<Id, Options, ParentIds>;

/**
 * Definition of core args with static keys for generics.
 */
export type CoreArgNever<
	Id extends CoreArgIds,
	// Will be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArgPathNever<Id, Options, ParentIds>;
