/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
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

import axios from "axios";
import { ClientShard } from "./client/shard";
import { ClientUniverse } from "./client/universe";
import { MessageTypeWord, vSocketMaxQueue } from "./common/defaults/connection";
import { VStandaloneSocket } from "./common/vsocket";
import { Application } from "./comms/application";
import { Envelope } from "./comms/connection";
import { CommsShardArgs } from "./comms/shard";
import { ServerUniverse } from "./server/universe";
import { compile } from "./tool/compile";

// Injection
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	let clientUniverseElement: HTMLElement | null = document.getElementById("client-universe");
	let application: Application = new Application();
	let serverUniverse: ServerUniverse = await application.addUniverse({ Universe: ServerUniverse });
	let clientUniverse: ClientUniverse = await application.addUniverse({
		Universe: ClientUniverse,
		args: { element: clientUniverseElement === null ? document.body : clientUniverseElement }
	});

	// Compile
	// Axios returns an object
	// eslint-disable-next-line @typescript-eslint/ban-types
	let shardData: object = compile((await axios.get("/data/shard/cave.dt.yml")).data);

	// Sockets
	let clientSocket: VStandaloneSocket = new VStandaloneSocket({
		/**
		 * Client callback.
		 */
		callback(): void {
			let counter: number = 0;
			while (counter++ < vSocketMaxQueue) {
				let envelope: Envelope = clientSocket.readQueue();
				let promise: Promise<ClientShard>;

				// Break
				if (envelope.type === MessageTypeWord.Empty) break;

				// Switch
				switch (envelope.type) {
					case MessageTypeWord.Sync:
						console.log("Sync");
						clientUniverse.addShard(envelope.message as CommsShardArgs);

						// Attach canvas
						promise = (async () => clientUniverse.getShard({ shardUuid: (shardData as CommsShardArgs).shardUuid }))();
						promise.then(
							defaultShard => {
								defaultShard.attach(clientUniverseElement === null ? document.body : clientUniverseElement);
							},
							() => {}
						);
						break;
					default:
				}
			}
		},
		/**
		 * Server callback.
		 */
		secondary(): void {
			serverSocket.readQueue();
		}
	});
	let serverSocket: VStandaloneSocket = clientSocket.target;
	serverSocket.send({ message: shardData, type: MessageTypeWord.Sync });
}

// Call main
// Async entrypoint
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

// #ifset _DEBUG_ENABLED
console.log("debug");
// #endif
