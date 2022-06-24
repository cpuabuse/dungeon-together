/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import axios from "axios";
import { LogLevel, processLog } from "../client/error";
import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Envelope, Message, ProcessCallback, VSocket } from "../core/connection";
import { compile } from "../yaml/compile";
import { ServerUniverse } from "./universe";

/**
 * Temp shard to send to client.
 */
// Axios returns an object
// eslint-disable-next-line @typescript-eslint/ban-types
const shardDataPromise: Promise<object> = new Promise(resolve => {
	axios.get("/data/shard/cave.dt.yml").then(
		result => {
			// This whole structure to be removed
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			resolve(compile(result.data));
		},
		() => {
			// Do nothing
		}
	);
});

/**
 * Queue process callback for socket.
 *
 * @returns `true` if the callback was processed, `false` if additional processing is required
 */
export const queueProcessCallback: ProcessCallback<VSocket<ServerUniverse>> = async function () {
	// Get temp shard data
	// Axios returns an object
	// eslint-disable-next-line @typescript-eslint/ban-types
	let shardData: object = await shardDataPromise;

	// Message reading loop
	let counter: number = 0;
	while (counter++ < vSocketMaxDequeue) {
		// Get message
		const message: Message = this.readQueue();

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Sync command
			case MessageTypeWord.Sync:
				processLog({ error: new Error(`Server synchronization started`), level: LogLevel.Info });
				// Await is inside of the loop, but also the switch
				// eslint-disable-next-line no-await-in-loop
				await this.send({
					envelope: new Envelope({ messages: [{ body: shardData, type: MessageTypeWord.Sync }] })
				});
				break;

			// Continue loop on default
			default:
				processLog({ error: new Error(`Unknown message type: "${message.type}"`), level: LogLevel.Info });
		}
	}

	// Return
	return false;
};
