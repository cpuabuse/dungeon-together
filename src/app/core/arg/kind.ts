/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Kind related options.
 *
 * @file
 */

import { CoreArgOptionIds, CoreArgOptionsUnionGenerate } from "./options";

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithKindUnion = CoreArgOptionsUnionGenerate<CoreArgOptionIds.Kind>;
