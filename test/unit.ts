/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Tests for core
 */

import { init } from "./init";
import { childMetaIdToExpected, childMetaIdToId, childMetaIdToOwn, tTest } from "./unit/core/child-meta";
import { unitTest } from "./unit/core/convert-arg";

init();
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
