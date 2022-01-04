/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

import { CoreArgsOptionIds, coreArgsOptionIdsToOptions } from "../core/arg";

/**
 * Args options for server.
 */
// Infer for to save lines
// eslint-disable-next-line @typescript-eslint/typedef
export const serverSystemArgsOptions = coreArgsOptionIdsToOptions({
	idsSet: new Set([
		CoreArgsOptionIds.Nav,
		CoreArgsOptionIds.Kind,
		CoreArgsOptionIds.Path,
		CoreArgsOptionIds.Map,
		CoreArgsOptionIds.Vector
	] as const)
});
