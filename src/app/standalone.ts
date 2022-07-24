/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone entrypoint.
 */

/**
 * @license ISC
 * ISC License (ISC)
 *
 * Copyright 2020 cpuabuse.com
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {
	initProcessCallback as clientInitProcessCallback,
	queueProcessCallback as clientQueueProcessCallback
} from "./client/connection";
import { ClientUniverse } from "./client/universe";
import { SocketProcessBase, ToSuperclassProcessCallback, VStandaloneSocket, processInitWord } from "./common/vsocket";
import { Application } from "./core/application";
import { queueProcessCallback as serverQueueProcessCallback } from "./server/connection";
import { ServerUniverse } from "./server/universe";

// Injection
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	// Get the element to attach the universe
	let clientUniverseElement: HTMLElement | null = document.getElementById("client-universe");

	// Define the application to use
	let application: Application = new Application();

	// Generate universes/prototype chains
	let serverUniverse: ServerUniverse = await application.addUniverse({ Universe: ServerUniverse });
	let clientUniverse: ClientUniverse = await application.addUniverse({
		Universe: ClientUniverse,
		args: { element: clientUniverseElement === null ? document.body : clientUniverseElement }
	});

	/**
	 * Dummy sync function.
	 */
	function sync(): void {
		// Do nothing
	}

	// Sockets
	let clientSocket: VStandaloneSocket<ClientUniverse, ServerUniverse> = new VStandaloneSocket({
		primary: {
			callback: clientQueueProcessCallback,
			sync,
			universe: clientUniverse
		},
		secondary: { callback: serverQueueProcessCallback, sync, universe: serverUniverse }
	});

	// Add a initialization process
	clientSocket.addProcess({
		callback: clientInitProcessCallback as ToSuperclassProcessCallback<
			typeof clientInitProcessCallback,
			SocketProcessBase
		>,
		word: processInitWord
	});

	// Dispatch init process
	await clientSocket.tick({ word: processInitWord });
}

// Call main
// Async entrypoint
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

// #ifset _DEBUG_ENABLED
console.log("debug");
// #endif
