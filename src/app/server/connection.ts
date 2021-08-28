/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import axios from "axios";
import { LogLevel, processLog } from "../client/error";
import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ProcessCallback, VSocket } from "../common/vsocket";
import { CommsConnection, CommsConnectionArgs, Envelope, Message } from "../comms/connection";
import { CoreUniverse } from "../comms/universe";
import { compile } from "../tool/compile";
import { ServerUniverse } from "./universe";

/**
 * Server connection.
 */
export class ServerConnection implements CommsConnection {
	/**
	 * Server shards.
	 */
	public shardUuids: Set<Uuid> = new Set();

	/**
	 * The target, be it standalone, remote or absent.
	 */
	public socket: VSocket<CoreUniverse>;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({ socket }: CommsConnectionArgs) {
		// Set this target
		this.socket = socket;
	}
}

/**
 * Temp shard to send to client.
 */
// Axios returns an object
// eslint-disable-next-line @typescript-eslint/ban-types
const shardDataPromise: Promise<object> = new Promise(resolve => {
	axios.get("/data/shard/cave.dt.yml").then(
		result => {
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
