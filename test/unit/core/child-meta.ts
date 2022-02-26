/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test for core
 */

import { ok } from "assert";

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
