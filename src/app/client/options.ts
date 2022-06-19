/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Options for client.
 *
 * @file
 */

import {
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions
} from "../core/arg";

/**
 * Client options type.
 */
export type ClientOptions = CoreArgOptionsGenerate<
	CoreArgOptionIds.Map | CoreArgOptionIds.Vector,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
>;

/**
 * Client options.
 */
// eslint-disable-next-line @typescript-eslint/typedef
export const clientOptions: ClientOptions = coreArgOptionIdsToOptions({
	idSet: new Set(),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]])
});
