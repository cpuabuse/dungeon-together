/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test main function.
 */

import { ok } from "assert";
import { Application } from "../../../src/app/core/application";
import { ServerUniverse } from "../../../src/app/server/universe";

/**
 * Performs unit tests.
 */
export function unitTest(): void {
	// Test if {@link initUniverse} returns a universe during initialization.
	describe("serverUniverse", function () {
		let serverUniverse: ServerUniverse;

		// The describe function will execute only after the before function is done
		before(async function () {
			// Define the application to use
			let application: Application = new Application();

			// Generate universes/prototype chains
			serverUniverse = await application.addUniverse({ Universe: ServerUniverse });
		});

		describe("universe prototype", function () {
			// Initialization test
			it(`should create a universe of class "ServerUniverse"`, function () {
				ok(serverUniverse instanceof ServerUniverse);
			});
		});
	});
}
