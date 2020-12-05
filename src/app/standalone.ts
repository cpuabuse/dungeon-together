/**
 * A standalone client, working solely in the browser.
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

import { getShard, initUniverse as initClientUniverse } from "./client/universe";
import { ClientProto } from "./client/proto";
import { ClientShard } from "./client/shard";
import { CommsShardArgs } from "./comms/shard";
import axios from "axios";
import { initUniverse as initServerUniverse } from "./server/universe";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	// Init
	await Promise.all([initClientUniverse(), initServerUniverse()]);

	// Get defaults
	let shardData: object = await new Promise(function (resolve) {
		axios.get("/test/data/shard.coord.3-3-1.dt.json").then(function (data) {
			resolve(data.data);
		});
	});

	ClientProto.prototype.universe.addShard(shardData as CommsShardArgs);

	let defaultShard: ClientShard = await getShard({ shardUuid: "00584037-3ca6-4fb0-9178-50594152f3b7" });
	// Attach canvas
	defaultShard.attach(document.body);
}

// Call main
main();