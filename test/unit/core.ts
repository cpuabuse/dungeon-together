/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Tests for core
 */

import { childMetaIdToExpected, childMetaIdToId, childMetaIdToOwn, tTest } from "./core/child-meta";
import { unitTest } from "./core/convert-arg";

/**
 * Unit test for core.
 */
export function unitCoreTest(): void {
	unitTest();

	describe("createChildMeta", function () {
		it("should work", tTest);

		describe("ID to ID", function () {
			it("should produce the same meta", childMetaIdToId);
		});

		describe("ID to own", function () {
			it("should produce correct meta", childMetaIdToOwn);
		});

		describe("ID to expected", function () {
			it("should produce correct meta", childMetaIdToExpected);
		});
	});
}
