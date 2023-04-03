/*
	Copyright 2023 cpuabuse.com
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

import { StandaloneApplication } from "../app/application/standalone";
import { ClientConnection, ClientMessage } from "../app/client/connection";
import { ClientUniverse } from "../app/client/universe";
import { Uuid } from "../app/common/uuid";
import { CoreStandaloneSocket, processInitWord } from "../app/core/connection";
import { CoreLog, LogLevel } from "../app/core/error";
import { ServerConnection, ServerMessage } from "../app/server/connection";
import { ServerShard } from "../app/server/shard";
import { ServerUniverse } from "../app/server/universe";
import { systemModuleFactory } from "../module/system";

// Injection
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	// Infer for appropriate types
	// eslint-disable-next-line @typescript-eslint/typedef
	const application = new StandaloneApplication({
		element: "client-universe",
		records: [{ depends: {}, factory: systemModuleFactory, name: "system" }],
		yamlList: {
			cave: {
				path: "data/shard/cave.dt.yml",
				type: "url"
			}
		}
	});
	// Generate universes/prototype chains
	let serverUniverse: ServerUniverse = await application.serverLoader.addUniverse({ yamlId: "cave" });
	let clientUniverse: ClientUniverse = await application.clientLoader.addUniverse();

	// Sockets
	let clientSocket: CoreStandaloneSocket<ClientMessage, ServerMessage> = new CoreStandaloneSocket({});

	// Connections
	let clientConnection: ClientConnection = new ClientConnection({
		connectionUuid: "connect",
		socket: clientSocket,
		universe: clientUniverse
	});
	let serverConnection: ServerConnection = new ServerConnection({
		connectionUuid: "connect",
		socket: clientSocket.target,
		universe: serverUniverse
	});
	let shard: ServerShard = Array.from(serverUniverse.shards)[1][1];
	shard.dictionary.shardName = "Game";
	let playerUuid: Uuid = Array.from(shard.players)[2][0];
	serverConnection.registerShard({ playerUuid, shardUuid: shard.shardUuid });

	// Dispatch init process
	await clientConnection.tick({ word: processInitWord });
}

// Call main
// Async entrypoint
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

// #if _DEBUG_ENABLED
// For testing
CoreLog.global.log({ level: LogLevel.Debug, message: "Debug enabled." });
// #endif
