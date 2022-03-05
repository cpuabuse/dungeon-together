/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test for core
 */

import { deepStrictEqual, ok } from "assert";
import { MaybeDefined } from "../../../src/app/common/utility-types";
import {
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathId,
	coreArgChildMetaGenerate,
	coreArgComplexOptionSymbolIndex,
	coreArgOptionIdsToOptions,
	CoreArgOptionsUnion,
	CoreArg
} from "../../../src/app/core/arg";

/**
 * Helper function testing meta creation.
 */
function metaGenerateTest<
	ChildId extends CoreArgIds,
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
		expected: CoreArgMeta<
			CoreArgIds.Cell,
			CoreArgOptionsPathId,
			CoreArgOptionsPathId,
			CoreArgIds.Grid | CoreArgIds.Shard
		>;

		/**
		 * Index of child.
		 */
		index: number;

		/**
		 * Next id.
		 */
		childArgId: ChildId;

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
			parentArgId: ParentId;

			/**
			 * Parent source arg.
			 */
			sourceParentArg: CoreArg<ParentId, SourceOptions, GrandparentIds>;
		}
	>
): () => void {
	return function () {
		const actual: CoreArgMeta<
			CoreArgIds.Cell,
			CoreArgOptionsPathId,
			CoreArgOptionsPathId,
			CoreArgIds.Grid | CoreArgIds.Shard
		> = coreArgChildMetaGenerate(param);

		deepStrictEqual(actual, param.expected);
	};
}

const optionsPathId: CoreArgOptionsPathId = coreArgOptionIdsToOptions({
	idSet: new Set(),
	symbolSet: new Set([coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]])
});

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
	childArgId: CoreArgIds.Cell,
	index: 0,
	meta: {},
	parentArgId: CoreArgIds.Grid,
	sourceOptions: optionsPathId,
	sourceParentArg: {
		id: "test"
	},
	targetOptions: optionsPathId,
	expected: {}
});

/**
 * Test ID to own.
 */
export function childMetaIdToOwn(): void {
	ok(true);
}
