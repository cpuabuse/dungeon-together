/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Raw pre-conversion data
 */

import { CoreArgOptionIds, coreArgOptionIdsToOptions } from "./arg";

/**
 * Args options for compilation output.
 */
// Infer to save lines
// eslint-disable-next-line @typescript-eslint/typedef
export const rawArgOptions = coreArgOptionIdsToOptions({
	idSet: new Set([CoreArgOptionIds.Kind, CoreArgOptionIds.Path, CoreArgOptionIds.Vector] as const)
});
