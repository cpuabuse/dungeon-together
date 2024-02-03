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
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	CoreArgOptionsPathId,
	CoreArgOptionsPathOwn,
	coreArgConvert
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
		arg,
		sourceOptions,
		targetOptions
	}: {
		/**
		 * Expected result.
		 */
		expected: CoreArg<Id, TargetOptions, ParentIds>;

		/**
		 * Meta.
		 */
		meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;

		/**
		 * Source path.
		 */
		arg: CoreArg<Id, SourceOptions, ParentIds>;

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
				coreArgConvert({
					arg,
					id,
					meta,
					parentIds,
					sourceOptions,
					targetOptions
					// Parent ids is conditional generic
				} as Parameters<typeof coreArgConvert>[0]),
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
		arg,
		sourceOptions
	}: {
		/**
		 * Source path.
		 */
		arg: CoreArg<Id, SourceOptions, ParentIds>;

		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;
	} & BaseParam<Id, ParentIds>): PathConvertToIdTests {
		let result: CoreArg<Id, CoreArgOptionsPathId, ParentIds> = coreArgConvert({
			arg,
			id,
			meta: {},
			parentIds,
			sourceOptions,
			targetOptions: optionsPathId
			// Parent ids is conditional generic
		} as Parameters<typeof coreArgConvert>[0]);

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
		arg: { cellUuid: defaultCellUuid },
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
			arg: {
				cellUuid: defaultCellUuid,
				gridUuid: defaultGridUuid,
				shardUuid: defaultShardUuid
			},
			sourceOptions: optionsPathExtended
		}),

		shard: pathConvertToIdTests({
			...shardBaseParam,
			arg: { shardUuid: defaultShardUuid },
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
						arg: {},
						expected: {},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceOptions: optionsPathId,
						targetOptions: optionsPathId
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						arg: { id: defaultId },
						expected: { id: defaultId },
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Cell]: defaultCellPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
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
						arg: {},
						expected: {},
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
						sourceOptions: optionsPathId,
						targetOptions: optionsPathId
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...shardBaseParam,
						arg: { id: defaultId },
						expected: { id: defaultId },
						meta: {
							origin: defaultOrigin,
							paths: {
								[CoreArgIds.Shard]: defaultShardPath
							},
							systemNamespace: defaultSystemNameSpace,
							userNamespace: defaultUserNameSpace
						},
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
						arg: {},
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
						sourceOptions: optionsPathId,
						targetOptions: optionsPathOwn
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						arg: { id: defaultId },
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
						arg: {},
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
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					})
				);

				it(
					"should convert path, when ID is defined",
					pathConvertTest({
						...cellBaseParam,
						arg: { id: defaultId },
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
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					})
				);
			});

			describe("shard", function () {
				it("should convert path, when ID is undefined", function () {
					pathConvertTest({
						...shardBaseParam,
						arg: {},
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
						sourceOptions: optionsPathId,
						targetOptions: optionsPathExtended
					});
				});

				it("should convert path, when ID is defined", function () {
					pathConvertTest({
						...shardBaseParam,
						arg: { id: defaultId },
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
						arg: { cellUuid: defaultCellUuid },
						expected: { cellUuid: defaultCellUuid },
						meta: {},
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
						arg: { cellUuid: defaultCellUuid },
						expected: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						meta: {
							parentArgPath: { gridUuid: defaultGridUuid, shardUuid: defaultShardUuid }
						},
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
						arg: { shardUuid: defaultShardUuid },
						expected: { shardUuid: defaultShardUuid },
						meta: {
							parentArgPath: {}
						},
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
						arg: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						expected: { cellUuid: defaultCellUuid },
						meta: {},
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
						arg: { shardUuid: defaultShardUuid },
						expected: { shardUuid: defaultShardUuid },
						meta: {},
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
						arg: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						expected: { cellUuid: defaultCellUuid, gridUuid: defaultGridUuid, shardUuid: defaultShardUuid },
						meta: {},
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
						arg: { shardUuid: defaultShardUuid },
						expected: { shardUuid: defaultShardUuid },
						meta: {},
						sourceOptions: optionsPathExtended,
						targetOptions: optionsPathExtended
					})
				);
			});
		});
	});
}
