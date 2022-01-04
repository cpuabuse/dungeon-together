/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { CoreArgOptionIds, CoreArgOptionsUnion, CoreArgWithoutPathMeta } from ".";

/**
 * Metadata for arg.
 */
export type CoreArgMeta<O extends CoreArgOptionsUnion> = O[CoreArgOptionIds.Path] extends true
	? CoreArgWithoutPathMeta
	: never;
