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
import { ClientProto } from "./client/proto";
import { ClientShard } from "./client/shard";
import { getShard, initUniverse as initClientUniverse } from "./client/universe";
import { CommsShardArgs } from "./comms/shard";
import { initUniverse as initServerUniverse } from "./server/universe";
import { compile } from "./tool/compile";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	// Init
	await Promise.all([initClientUniverse(), initServerUniverse()]);

	// Get defaults
	// Axios returns an object
	// eslint-disable-next-line @typescript-eslint/ban-types
	let shardData: object = compile(await axios.get("/data/shard/cave.dt.yml"));

	ClientProto.prototype.universe.addShard(shardData as CommsShardArgs);

	let defaultShard: ClientShard = await getShard({ shardUuid: (shardData as CommsShardArgs).shardUuid });
	// Attach canvas
	defaultShard.attach(document.body);
}

// Call main
// Async entrypoint
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
