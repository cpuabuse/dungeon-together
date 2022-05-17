/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vector types.
 *
 * @file
 */

import { CoreArgOptionIds, CoreArgOptionsUnionGenerate } from "./options";

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithVectorUnion = CoreArgOptionsUnionGenerate<CoreArgOptionIds.Vector>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithoutVectorUnion = CoreArgOptionsUnionGenerate<never, CoreArgOptionIds.Vector>;
