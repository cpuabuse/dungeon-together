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

import { InitClient, getCanvas } from "./client/client";
import { InitServer, getShard } from "./server/server";
import { Canvas } from "./client/canvas";
import { Shard } from "./server/shard";
import { defaultInstanceUuid } from "./common/defaults";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
	// Init
	await InitServer();
	await InitClient();

	// Get defaults
	let defaultCanvas: Canvas = await getCanvas({ instanceUuid: defaultInstanceUuid });
	let defaultShard: Shard = await getShard({ instanceUuid: defaultInstanceUuid });

	// Attach canvas
	defaultCanvas.attach(document.body);
}

// Call main
main();
