/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CoreArgOptionIds, CoreArgOptionsUnionGenerate } from "./options";

/**
 * Nav options.
 *
 * @file
 */

/**
 * Union of options with nav.
 */
export type CoreArgOptionsWithNavUnion = CoreArgOptionsUnionGenerate<CoreArgOptionIds.Nav>;
