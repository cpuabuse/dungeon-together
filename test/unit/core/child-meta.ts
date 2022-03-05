/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test for core
 */

import { deepStrictEqual, ok } from "assert";
import {
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathId,
	coreArgChildMetaGenerate,
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions
} from "../../../src/app/core/arg";

/**
 * Test value.
 */
const t: string = "test";

/**
 * Test function.
 */
export function tTest(): void {
	ok(t === "test");
}

/**
 * Test ID to ID.
 */
export function childMetaIdToId(): void {
	const optionsPathId: CoreArgOptionsPathId = coreArgOptionIdsToOptions({
		idSet: new Set(),
		symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
	});

	const expected: CoreArgMeta<
		CoreArgIds.Cell,
		CoreArgOptionsPathId,
		CoreArgOptionsPathId,
		CoreArgIds.Grid | CoreArgIds.Shard
	> = {};

	const actual: CoreArgMeta<
		CoreArgIds.Cell,
		CoreArgOptionsPathId,
		CoreArgOptionsPathId,
		CoreArgIds.Grid | CoreArgIds.Shard
	> = coreArgChildMetaGenerate({
		childArgId: CoreArgIds.Cell,
		index: 0,
		meta: {},
		parentArgId: CoreArgIds.Grid,
		sourceOptions: optionsPathId,
		sourceParentArg: {
			id: "test"
		},
		targetOptions: optionsPathId
	});

	deepStrictEqual(actual, expected);
}
