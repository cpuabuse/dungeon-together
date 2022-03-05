/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { tTest } from "./unit/core/child-meta";
import { unitTest } from "./unit/core/convert-path";

/**
 * @file Tests for core
 */

unitTest();

describe("createChildMeta", function () {
	it("should work", tTest);
});
