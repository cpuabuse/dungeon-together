/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import {
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgOptionIds,
	CoreArgOptionsUnionGenerate
} from "../arg";

/**
 * Args options constraint for core universe objects.
 */
export type CoreUniverseObjectArgsOptionsUnion = CoreArgOptionsUnionGenerate<
	CoreArgOptionIds.Map,
	never,
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;
