/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit tests for core
 */

import { deepStrictEqual, ok } from "assert";
import { hasOwnProperty } from "../../../src/app/common/utility-types";
import { getDefaultUuid } from "../../../src/app/common/uuid";
import {
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	CoreArgOptionsPathId,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	coreArgPathConvert
} from "../../../src/app/core/arg";
import { optionsPathExtended, optionsPathId, optionsPathOwn } from "./lib/options";
import {
	defaultCellPath,
	defaultCellUuid,
	defaultGridPath,
	defaultGridUuid,
	defaultId,
	defaultOrigin,
	defaultShardPath,
	defaultShardUuid,
	defaultSystemNameSpace,
	defaultUserNameSpace
} from "./lib/path";

/**
 * Unit tests function.
 */
export function unitTest(): void {
	/**
	 * Type placeholder.
	 */
	type CoreArgOptionsPathExtended = CoreArgOptionsGenerate<
		never,
		CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
	>;

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
	 * @returns Function to be run by `it`
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

	/**
	 * Return type of {@link pathConvertToIdTests}.
	 */
	type PathConvertToIdTests = {
		[K in "contain" | "str" | "empty"]: [string, () => void];
	};

	/**
	 * Creates tests for conversion of UUID to ID.
	 *
	 * @param param - Destructured parameter
	 * @returns Tests
	 */
	function pathConvertToIdTests<
		Id extends CoreArgIds,
		SourceOptions extends CoreArgOptionsPathId | CoreArgOptionsPathOwn | CoreArgOptionsPathExtended,
		ParentIds extends CoreArgIds = never
	>({
		id,
		parentIds,
		sourceArgPath,
		sourceOptions
	}: {
		/**
		 * Source path.
		 */
		sourceArgPath: CoreArgPath<Id, SourceOptions, ParentIds>;

		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;
	} & BaseParam<Id, ParentIds>): PathConvertToIdTests {
		let result: CoreArgPath<Id, CoreArgOptionsPathId, ParentIds> = coreArgPathConvert({
			id,
			meta: {},
			parentIds,
			sourceArgPath,
			sourceOptions,
			targetOptions: optionsPathId
		});

		return {
			/**
			 * Test to contain ID.
			 */
			contain: [
				"should contain ID",
				function (): void {
					ok(hasOwnProperty(result, "id"));
				}
			],

			/**
			 * Test for ID to be string.
			 */
			empty: [
				"ID should be string",
				function (): void {
					ok(typeof result.id === "string");
				}
			],

			/**
			 * Test for ID not to be empty.
			 */
			str: [
				"ID should not be empty",
				function (): void {
					// Fails on no property, if not, works as a predicate for chained comparison; Ambiguity is OK because in the end flow does not really matter, since Mocha will fail, if anything
					ok(hasOwnProperty(result, "id") && result.id.length > 0);
				}
			]
		};
	}

	const cellBaseParam: BaseParam<CoreArgIds.Cell, CoreArgIds.Shard | CoreArgIds.Grid> = {
		id: CoreArgIds.Cell,
		parentIds: new Set([CoreArgIds.Shard, CoreArgIds.Grid])
	};
	const shardBaseParam: BaseParam<CoreArgIds.Shard> = {
		id: CoreArgIds.Shard,
		parentIds: new Set()
	};

	// Tests
	const ownToIdTests: PathConvertToIdTests = pathConvertToIdTests({
		...cellBaseParam,
		sourceArgPath: { cellUuid: defaultCellUuid },
		sourceOptions: optionsPathOwn
	});
	const extendedToIdTests: {
		/**
		 * Cell.
		 */
		cell: PathConvertToIdTests;

		/**
		 * Shard.
		 */
		shard: PathConvertToIdTests;
	} = {
		cell: pathConvertToIdTests({
			...cellBaseParam,
			sourceArgPath: {
				cellUuid: defaultCellUuid,
				gridUuid: defaultGridUuid,
				shardUuid: defaultShardUuid
			},
			sourceOptions: optionsPathExtended
		}),

		shard: pathConvertToIdTests({
			...shardBaseParam,
			sourceArgPath: { shardUuid: defaultShardUuid },
			sourceOptions: optionsPathExtended
		})
	};

	// Tests will run for cell because it has both children and parents; when extended path is involved, test should be run for shard as well, as it has no parents; when ID to ID conversion is made, test should be run for shards as well, as it is very simple
	describe("coreArgPathConvert()", function () {
		describe("ID to ID", function () {
			describe("cell", function () {
				it(
					"should convert path, when ID is undefined",
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
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						expected: { id: defaultId },
						meta: {},
						sourceArgPath: { id: defaultId },
						sourceOptions: optionsPathId,
						targetOptions: optionsPathId
					})
				);
			});

			describe("shard", function () {
				it(
					"should convert path, when ID is undefined",
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
					"should convert path, when ID is defined",
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

		describe("ID to own", function () {
			describe("cell", function () {
				it(
					"should convert path, when ID is undefined",
					pathConvertTest({
						...cellBaseParam,
						expected: {
							cellUuid: getDefaultUuid({
								origin: defaultOrigin,
								path: defaultCellPath
							})
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: {},
						sourceOptions: optionsPathId,
						targetOptions: optionsPathOwn
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						expected: {
							cellUuid: getDefaultUuid({
								origin: defaultOrigin,
								path: defaultCellPath
							})
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: { id: defaultId },
						sourceOptions: optionsPathId,
						targetOptions: optionsPathOwn
					})
				);
			});
		});

		describe("ID to extended", function () {
			describe("cell", function () {
				it(
					"should convert path, when ID is undefined",
					pathConvertTest({
						...cellBaseParam,
						expected: {
							cellUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultCellPath }),
							gridUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultGridPath }),
							shardUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultShardPath })
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath,
								[CoreArgIds.Grid]: defaultGridPath,
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: {},
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						expected: {
							cellUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultCellPath }),
							gridUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultGridPath }),
							shardUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultShardPath })
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath,
								[CoreArgIds.Grid]: defaultGridPath,
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: { id: defaultId },
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					})
				);
			});

			describe("shard", function () {
				it("should convert path, when ID is undefined", function () {
					pathConvertTest({
						...shardBaseParam,
						expected: {
							shardUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultShardPath })
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: {},
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					});
				});

				it("should convert path, when ID is defined", function () {
					pathConvertTest({
						...shardBaseParam,
						expected: {
							shardUuid: getDefaultUuid({ origin: defaultOrigin, path: defaultShardPath })
						},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceArgPath: { id: defaultId },
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					});
				});
			});
		});

		describe("own to ID", function () {
			describe("cell", function () {
				it(...ownToIdTests.contain);
				it(...ownToIdTests.str);
				it(...ownToIdTests.empty);
			});
		});

		describe("own to own", function () {
			describe("cell", function () {
				it(
					"should convert path",
					pathConvertTest({
						...cellBaseParam,
						expected: { cellUuid: defaultCellUuid },
						meta: {},
						sourceArgPath: { cellUuid: defaultCellUuid },
						sourceOptions: optionsPathOwn,
						targetOptions: optionsPathOwn
					})
				);
			});
		});

		describe("own to extended", function () {
			describe("cell", function () {
				it(
					"should convert path",
					pathConvertTest({
						...cellBaseParam,
						expected: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						meta: {
							parentArgPath: { gridUuid: defaultGridUuid, shardUuid: defaultShardUuid }
						},
						sourceArgPath: { cellUuid: defaultCellUuid },
						sourceOptions: optionsPathOwn,
						targetOptions: optionsPathExtended
					})
				);
			});

			describe("shard", function () {
				it(
					"should convert path",
					pathConvertTest({
						...shardBaseParam,
						expected: { shardUuid: defaultShardUuid },
						meta: {
							parentArgPath: {}
						},
						sourceArgPath: { shardUuid: defaultShardUuid },
						sourceOptions: optionsPathOwn,
						targetOptions: optionsPathExtended
					})
				);
			});
		});

		describe("extended to ID", function () {
			describe("cell", function () {
				it(...extendedToIdTests.cell.contain);
				it(...extendedToIdTests.cell.str);
				it(...extendedToIdTests.cell.empty);
			});

			describe("shard", function () {
				it(...extendedToIdTests.shard.contain);
				it(...extendedToIdTests.shard.str);
				it(...extendedToIdTests.shard.empty);
			});
		});

		describe("extended to own", function () {
			describe("cell", function () {
				it(
					"should convert path",
					pathConvertTest({
						...cellBaseParam,
						expected: { cellUuid: defaultCellUuid },
						meta: {},
						sourceArgPath: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						sourceOptions: optionsPathExtended,
						targetOptions: optionsPathOwn
					})
				);
			});

			describe("shard", function () {
				it(
					"should convert path",
					pathConvertTest({
						...shardBaseParam,
						expected: { shardUuid: defaultShardUuid },
						meta: {},
						sourceArgPath: { shardUuid: defaultShardUuid },
						sourceOptions: optionsPathExtended,
						targetOptions: optionsPathOwn
					})
				);
			});
		});

		describe("extended to extended", function () {
			describe("cell", function () {
				it(
					"should convert path",
					pathConvertTest({
						...cellBaseParam,
						expected: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						meta: {},
						sourceArgPath: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						sourceOptions: optionsPathExtended,
						targetOptions: optionsPathExtended
					})
				);
			});

			describe("shard", function () {
				it(
					"should convert path",
					pathConvertTest({
						...shardBaseParam,
						expected: { shardUuid: defaultShardUuid },
						meta: {},
						sourceArgPath: { shardUuid: defaultShardUuid },
						sourceOptions: optionsPathExtended,
						targetOptions: optionsPathExtended
					})
				);
			});
		});
	});
}