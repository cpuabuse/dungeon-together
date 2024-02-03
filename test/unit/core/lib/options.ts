/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Options
 */

import {
	CoreArgComplexOptionPathIds,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathId,
	CoreArgOptionsPathOwn,
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions
} from "../../../../src/app/core/arg";

/**
 * Options where the path is ID.
 */
export const optionsPathId: CoreArgOptionsPathId = coreArgOptionIdsToOptions({
	idSet: new Set(),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
});

/**
 * Options where the path is own.
 */
export const optionsPathOwn: CoreArgOptionsPathOwn = coreArgOptionIdsToOptions({
	idSet: new Set(),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]])
});

/**
 * Options where the path is extended.
 */
export const optionsPathExtended: CoreArgOptionsPathExtended = coreArgOptionIdsToOptions({
	idSet: new Set(),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]])
});
