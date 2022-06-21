/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Options for server.
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
 * Server options type.
 */
export type ServerOptions = CoreArgOptionsGenerate<
	CoreArgOptionIds.Map | CoreArgOptionIds.Vector | CoreArgOptionIds.Kind | CoreArgOptionIds.Nav,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;

/**
 * Server options.
 */
// eslint-disable-next-line @typescript-eslint/typedef
export const serverOptions: ServerOptions = coreArgOptionIdsToOptions({
	idSet: new Set([CoreArgOptionIds.Map, CoreArgOptionIds.Vector, CoreArgOptionIds.Kind, CoreArgOptionIds.Nav]),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]])
});
