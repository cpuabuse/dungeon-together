/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test for core
 */

import { ok } from "assert";
import { assert } from "chai";
import { MaybeDefined } from "../../../src/app/common/utility-types";
import { CoreArg, CoreArgIds, CoreArgMeta, CoreArgOptionsUnion, coreArgMetaGenerate } from "../../../src/app/core/arg";
import { optionsPathId, optionsPathOwn } from "./lib/options";
import {
	defaultCellPath,
	defaultGridPath,
	defaultOrigin,
	defaultSystemNameSpace,
	defaultUserNameSpace
} from "./lib/path";

/**
 * Helper function testing meta creation.
 *
 * @param param - Destructured parameter
 * @returns Void function
 */
function metaGenerateTest<
	Id extends CoreArgIds,
	// Parent of `S`
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentId extends CoreArgIds,
	GrandparentIds extends CoreArgIds = never
>(
	param: {
		/**
		 * Expected meta.
		 */
		expected: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentId | GrandparentIds>;

		/**
		 * Index of child.
		 */
		index: number;

		/**
		 * Next id.
		 */
		id: Id;

		/**
		 * Options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Options.
		 */
		targetOptions: TargetOptions;

		/**
		 * Meta.
		 */
		meta: CoreArgMeta<ParentId, SourceOptions, TargetOptions, GrandparentIds>;
		// In case `ParentId` is never, will be evaluated to `never` if not a tuple
	} & MaybeDefined<
		[ParentId] extends [never] ? false : true,
		{
			/**
			 * Current id.
			 *
			 * @remarks
			 * Used as discriminator.
			 */
			parentId: ParentId;

			/**
			 * Parent source arg.
			 */
			parentArg: CoreArg<ParentId, SourceOptions, GrandparentIds>;
		}
	>
): () => void {
	return function () {
		const actual: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentId | GrandparentIds> = coreArgMetaGenerate<
			Id,
			SourceOptions,
			TargetOptions,
			ParentId,
			GrandparentIds
		>(param);

		assert.containSubset(actual, param.expected);
	};
}

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
export const childMetaIdToId: () => void = metaGenerateTest({
	expected: {
		origin: defaultOrigin,
		paths: {
			[CoreArgIds.Cell]: defaultCellPath
		},
		systemNamespace: defaultSystemNameSpace,
		userNamespace: defaultUserNameSpace
	},
	id: CoreArgIds.Cell,
	index: 0,
	meta: {
		origin: defaultOrigin,
		paths: {
			[CoreArgIds.Grid]: defaultGridPath
		},
		systemNamespace: defaultSystemNameSpace,
		userNamespace: defaultUserNameSpace
	},
	parentArg: {
		id: "test"
	},
	parentId: CoreArgIds.Grid,
	sourceOptions: optionsPathId,
	targetOptions: optionsPathId
});

/**
 * Test ID to own.
 */
export const childMetaIdToOwn: () => void = metaGenerateTest({
	expected: {
		origin: defaultOrigin,
		paths: {
			[CoreArgIds.Cell]: defaultCellPath
		},
		systemNamespace: defaultSystemNameSpace,
		userNamespace: defaultUserNameSpace
	},
	id: CoreArgIds.Cell,
	index: 0,
	meta: {
		origin: defaultOrigin,
		paths: {
			[CoreArgIds.Grid]: defaultGridPath
		},
		systemNamespace: defaultSystemNameSpace,
		userNamespace: defaultUserNameSpace
	},
	parentArg: {},
	parentId: CoreArgIds.Grid,
	sourceOptions: optionsPathId,
	targetOptions: optionsPathOwn
});

/**
 * Test ID to expected.
 */
export function childMetaIdToExpected(): void {
	ok(true);
}
