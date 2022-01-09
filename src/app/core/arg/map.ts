/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { CoreArg, CoreArgIds, CoreArgOptionIds, CoreArgOptionIdsToOptions, CoreArgOptionsUnion } from ".";

/**
 * @file Working with arg map
 */

/**
 * The type of the universe objects property in universe object args container with map.
 */
export type CoreArgsWithMapContainerArg<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Map<Uuid, N>;

/**
 * The type of the universe objects property in universe object args container without map.
 */
export type CoreArgsWithoutMapContainerArg<
	N extends CoreArg<I, O>,
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion
> = Array<N>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithMap = CoreArgOptionIdsToOptions<CoreArgOptionIds.Map>;

/**
 * Core arg options without map.
 */
export type CoreArgOptionsWithoutMap = CoreArgOptionIdsToOptions<never>;
