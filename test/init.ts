/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Test initialization
 */

import { use } from "chai";
import subset from "chai-subset";

/**
 * Initializes the test dependencies.
 */
export function init(): void {
	use(subset);
}
