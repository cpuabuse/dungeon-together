/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit tests for core
 */

import { deepStrictEqual } from "assert";
import {
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
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
	 * Generate a test for `it`.
	 *
	 * @returns Function to be run by `it`.
	 */
	function pathConvertTest<>({ sourceArgPath, meta, expected, sourceOptions, targetOptions }: {}): () => void {
		return function () {};
	}

	// Test will run on cell because it has both children and parents
	describe("coreArgPathConvert()", function () {
		/**
		 * Options used for path with ID.
		 */
		type OptionsPathId = CoreArgOptionsGenerate<
			never,
			CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
		>;

		let optionsPathId: OptionsPathId;
		let cellBaseParam: {
			/**
			 * Cell ID.
			 */
			id: CoreArgIds.Cell;

			/**
			 * Parents of a cell.
			 */
			parentIds: Set<CoreArgIds.Shard | CoreArgIds.Grid>;
		};

		before(function () {
			optionsPathId = coreArgOptionIdsToOptions({
				idSet: new Set(),
				symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
			});
			cellBaseParam = {
				id: CoreArgIds.Cell,
				parentIds: new Set([CoreArgIds.Shard, CoreArgIds.Grid])
			};
		});

		it("should convert from ID to ID, when its empty", function () {
			let sourceArgPath: CoreArgPath<CoreArgIds.Cell, OptionsPathId, CoreArgIds.Shard | CoreArgIds.Grid> = {};
			let meta: CoreArgMeta<CoreArgIds.Cell, OptionsPathId, OptionsPathId, CoreArgIds.Shard | CoreArgIds.Grid> = {};
			let expected: CoreArgPath<CoreArgIds.Cell, OptionsPathId, CoreArgIds.Grid> = {};
			deepStrictEqual(
				coreArgPathConvert({
					...cellBaseParam,
					meta,
					sourceArgPath,
					sourceOptions: optionsPathId,
					targetOptions: optionsPathId
				}),
				expected
			);
		});
	});
}
