/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { integrationTest } from "./integration/test";
import { systemTest } from "./system/test";
import { unitTest } from "./unit/test";

/**
 * Server test main function.
 */
export function serverTest(): void {
	// Calling all tests
	unitTest();
	integrationTest();
	systemTest();
}
