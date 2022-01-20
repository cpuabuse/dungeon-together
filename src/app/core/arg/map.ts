/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with arg map
 */

import { Uuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgIds,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	CoreArgOptionsUnion,
	CoreArgOptionsUnionGenerate
} from ".";

/**
 * The type of the universe objects property in universe object args container with map.
 *
 * @typeParam ChildArg - Arg object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreArgsWithMapContainerArg<
	ChildArg extends CoreArg<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = Map<Uuid, ChildArg>;

/**
 * The type of the universe objects property in universe object args container without map.
 *
 * @typeParam ChildArg - Arg object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreArgsWithoutMapContainerArg<
	ChildArg extends CoreArg<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = Array<ChildArg>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithMap = CoreArgOptionsGenerate<CoreArgOptionIds.Map>;

/**
 * Core arg options without map.
 */
export type CoreArgOptionsWithoutMap = CoreArgOptionsGenerate<never>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithMapUnion = CoreArgOptionsUnionGenerate<CoreArgOptionIds.Map>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithoutMapUnion = CoreArgOptionsUnionGenerate<never, CoreArgOptionIds.Map>;
