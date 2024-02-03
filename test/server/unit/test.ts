/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Unit test main function.
 */

import { ok } from "assert";
import { DeferredPromise } from "../../../src/app/common/async";
import { Application, applicationNamespace } from "../../../src/app/core/application";
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
			let application: Application = new Application({ path: applicationNamespace });

			// Generate universes/prototype chains
			const universeCreated: DeferredPromise<void> = new DeferredPromise();
			serverUniverse = application.addUniverse({
				Universe: ServerUniverse,
				args: [{ created: universeCreated }]
			});
			await universeCreated;
		});

		describe("universe prototype", function () {
			// Initialization test
			it(`should create a universe of class "ServerUniverse"`, function () {
				ok(serverUniverse instanceof ServerUniverse);
			});
		});
	});
}
