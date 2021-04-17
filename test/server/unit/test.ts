/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test main function.
 */

import { ok } from "assert";
import { ServerProto } from "../../../src/app/server/proto";
import { ServerUniverse, initUniverse } from "../../../src/app/server/universe";

/**
 * Performs unit tests.
 */
export function unitTest(): void {
	// Test if {@link initUniverse} returns a universe during initialization.
	describe("initUniverse()", function () {
		// The describe function will execute only after the before function is done
		before(async function () {
			await initUniverse();
		});

		describe("universe prototype", function () {
			// Initialization test
			it(`should create a universe of class "ServerUniverse"`, function () {
				ok(ServerProto.prototype.universe instanceof ServerUniverse);
			});
		});
	});
}
