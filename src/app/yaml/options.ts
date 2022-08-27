/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * `.dt.yml` arg options.
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
export type YamlOptions = CoreArgOptionsGenerate<
	CoreArgOptionIds.Vector | CoreArgOptionIds.Kind,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
>;

/**
 * Args options for compilation output.
 */
// Infer to save lines
// eslint-disable-next-line @typescript-eslint/typedef
export const yamlOptions: YamlOptions = coreArgOptionIdsToOptions({
	idSet: new Set([CoreArgOptionIds.Vector, CoreArgOptionIds.Kind]),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
});
