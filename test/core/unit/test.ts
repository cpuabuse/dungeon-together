/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit tests for core
 */

import { deepStrictEqual } from "assert";
import { UrlPath } from "../../../src/app/common/url";
import {
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathId,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions,
	coreArgPathConvert
} from "../../../src/app/core/arg";

/**
 * Unit tests function.
 */
export function unitTest(): void {
	/**
	 * Base parameter for convert test.
	 */
	type BaseParam<Id extends CoreArgIds, ParentIds extends CoreArgIds = never> = {
		/**
		 * Arg ID.
		 */
		id: Id;

		/**
		 * Parents of arg.
		 */
		parentIds: Set<ParentIds>;
	};

	/**
	 * Generate a test for `it`.
	 *
	 * @param param - Destructed parameter
	 * @returns Function to be run by `it`.
	 */
	function pathConvertTest<
		Id extends CoreArgIds,
		SourceOptions extends CoreArgOptionsPathId | CoreArgOptionsPathOwn | CoreArgOptionsPathExtended,
		TargetOptions extends CoreArgOptionsPathId | CoreArgOptionsPathOwn | CoreArgOptionsPathExtended,
		ParentIds extends CoreArgIds = never
	>({
		expected,
		id,
		meta,
		parentIds,
		sourceArgPath,
		sourceOptions,
		targetOptions
	}: {
		/**
		 * Expected result.
		 */
		expected: CoreArgPath<Id, TargetOptions, ParentIds>;

		/**
		 * Meta.
		 */
		meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;

		/**
		 * Source path.
		 */
		sourceArgPath: CoreArgPath<Id, SourceOptions, ParentIds>;

		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Target options.
		 */
		targetOptions: TargetOptions;
	} & BaseParam<Id, ParentIds>): () => void {
		return function () {
			deepStrictEqual(
				coreArgPathConvert({
					id,
					meta,
					parentIds,
					sourceArgPath,
					sourceOptions,
					targetOptions
				}),
				expected
			);
		};
	}

	const defaultId: UrlPath = "test/id";

	const cellBaseParam: BaseParam<CoreArgIds.Cell, CoreArgIds.Shard | CoreArgIds.Grid> = {
		id: CoreArgIds.Cell,
		parentIds: new Set([CoreArgIds.Shard, CoreArgIds.Grid])
	};

	const shardBaseParam: BaseParam<CoreArgIds.Shard> = {
		id: CoreArgIds.Shard,
		parentIds: new Set()
	};

	const optionsPathId: CoreArgOptionsPathId = coreArgOptionIdsToOptions({
		idSet: new Set(),
		symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
	});

	// Tests will run for cell because it has both children and parents; when extended path is involved, test should be run for shard as well, as it has no parents; when ID to ID conversion is made, test should be run for shards as well, as it is very simple
	describe("coreArgPathConvert()", function () {
		describe("ID to ID", function () {
			it(
				"should convert cell path, when ID is undefined",
				pathConvertTest({
					...cellBaseParam,
					expected: {},
					meta: {},
					sourceArgPath: {},
					sourceOptions: optionsPathId,
					targetOptions: optionsPathId
				})
			);

			it(
				"should convert cell path, when ID is defined",
				pathConvertTest({
					...cellBaseParam,
					expected: { id: defaultId },
					meta: {},
					sourceArgPath: { id: defaultId },
					sourceOptions: optionsPathId,
					targetOptions: optionsPathId
				})
			);

			it(
				"should convert shard path, when ID is undefined",
				pathConvertTest({
					...shardBaseParam,
					expected: {},
					meta: {},
					sourceArgPath: {},
					sourceOptions: optionsPathId,
					targetOptions: optionsPathId
				})
			);

			it(
				"should convert shard path, when ID is defined",
				pathConvertTest({
					...shardBaseParam,
					expected: { id: defaultId },
					meta: {},
					sourceArgPath: { id: defaultId },
					sourceOptions: optionsPathId,
					targetOptions: optionsPathId
				})
			);
		});
	});
}
