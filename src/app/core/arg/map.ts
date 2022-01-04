/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArg, CoreArgIds, CoreArgOptionsUnion } from ".";

/**
 * @file Working with arg map
 */

/**
 * The type of the universe objects property in universe object args container with map.
 */
export type CoreArgsWithMapContainer<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Map<Uuid, N>;

/**
 * The type of the universe objects property in universe object args container without map.
 */
export type CoreArgsWithoutMapContainer<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Array<N>;
