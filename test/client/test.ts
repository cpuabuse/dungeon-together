/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Main test file.
 */

import { integrationTest } from "./integration/test";
import { systemTest } from "./system/test";
import { unitTest } from "./unit/test";

/**
 * Client test main function.
 */
export function clientTest(): void {
	// Calling all tests
	unitTest();
	integrationTest();
	systemTest();
}