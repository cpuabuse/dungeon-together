/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

import { CoreArgsIds, coreArgsIdsToOptions } from "../core/args";

/**
 * Args options for server.
 */
// Infer for to save lines
// eslint-disable-next-line @typescript-eslint/typedef
export const serverSystemArgsOptions = coreArgsIdsToOptions({
	idsSet: new Set([CoreArgsIds.Nav, CoreArgsIds.Kind, CoreArgsIds.Path, CoreArgsIds.Map, CoreArgsIds.Vector] as const)
});
