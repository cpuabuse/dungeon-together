/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit tests for core
 */

import { deepStrictEqual, ok } from "assert";
import { UrlOrigin, UrlPath } from "../../../src/app/common/url";
import { hasOwnProperty } from "../../../src/app/common/utility-types";
import { Uuid, getDefaultUuid } from "../../../src/app/common/uuid";
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
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions,
	coreArgPathConvert
} from "../../../src/app/core/arg";

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

	const defaultSystemNameSpace: UrlPath = "system";
	const defaultUserNameSpace: UrlPath = "user";
	const defaultOrigin: UrlOrigin = new URL("https://example.com/dt");
	const defaultId: UrlPath = "test/id";
	const defaultShardPath: UrlPath = `${defaultSystemNameSpace}/universe-objects/0`;
	const defaultGridPath: UrlPath = `${defaultShardPath}/0`;
	const defaultCellPath: UrlPath = `${defaultGridPath}/0`;
	const defaultCellUuid: Uuid = getDefaultUuid({
		origin: defaultOrigin,
		path: defaultCellPath
	});
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
	const optionsPathOwn: CoreArgOptionsPathOwn = coreArgOptionIdsToOptions({
		idSet: new Set(),
		symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]])
	});
	const optionsPathExtended: CoreArgOptionsPathExtended = coreArgOptionIdsToOptions({
		idSet: new Set(),
		symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]])
	});

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
				let result: CoreArgPath<CoreArgIds.Cell, CoreArgOptionsPathId, CoreArgIds.Shard | CoreArgIds.Grid>;

				before(function () {
					result = coreArgPathConvert({
						...cellBaseParam,
						meta: {},
						sourceArgPath: { cellUuid: defaultCellUuid },
						sourceOptions: optionsPathOwn,
						targetOptions: optionsPathId
					});
				});

				it("should contain ID", function () {
					ok(hasOwnProperty(result, "id"));
				});

				it("ID should be string", function () {
					ok(typeof result.id === "string");
				});

				it("ID should not be empty", function () {
					// Fails on no property, if not, works as a predicate for chained comparison; Ambiguity is OK because in the end flow does not really matter, since Mocha will fail, if anything
					ok(hasOwnProperty(result, "id") && result.id.length > 0);
				});
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
	});
}
