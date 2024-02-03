/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Core args
 */

import { CoreArgOptionIds, CoreArgOptionsOverride } from "../arg";
import { CoreArgIndexableOptionsUnion } from "../indexable";

/**
 * Args options constraint for core universe objects.
 *
 * @remarks
 * Vector option added to the indexable.
 */
export type CoreUniverseObjectArgsOptionsUnion = CoreArgOptionsOverride<
	CoreArgIndexableOptionsUnion,
	CoreArgOptionIds.Vector
>;
