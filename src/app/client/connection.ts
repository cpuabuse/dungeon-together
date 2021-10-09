/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ProcessCallback, VSocket } from "../common/vsocket";
import { CommsConnection, CommsConnectionArgs, Envelope, Message } from "../comms/connection";
import { CommsShardArgs, CommsShardRaw, commsShardRawToArgs } from "../comms/shard";
import { CoreUniverse } from "../comms/universe";
import { LogLevel, processLog } from "./error";
import { ClientShard } from "./shard";
import { ClientUniverse } from "./universe";

/**
 * Client connection.
 */
export class ClientConnection implements CommsConnection {
	/**
	 * Client UUIDs.
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
 * Callback for sync.
 *
 * @param this - Socket
 * @returns Promise with `true`
 */
export const initProcessCallback: ProcessCallback<VSocket<ClientUniverse>> = async function () {
	await this.send({ envelope: new Envelope({ messages: [{ body: null, type: MessageTypeWord.Sync }] }) });
	return true;
};

/**
 * Queue process callback for socket.
 *
 * @returns `true` if the callback was processed, `false` if additional processing is required
 */
// Has to be async to work with VSocket
// eslint-disable-next-line @typescript-eslint/require-await
export const queueProcessCallback: ProcessCallback<VSocket<ClientUniverse>> = async function () {
	// Message reading loop
	let counter: number = 0;
	while (counter++ < vSocketMaxDequeue) {
		// Get message
		const message: Message = this.readQueue();

		// Shard
		let shard: ClientShard;
		let shardArgs: CommsShardArgs;

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Sync command
			case MessageTypeWord.Sync:
				processLog({ error: new Error(`Synchronization started`), level: LogLevel.Info });
				this.universe.addShard(message.body as CommsShardArgs);
				shard = this.universe.getShard(message.body as CommsShardArgs);
				shard.addSocket({ socket: this });
				shard.attach();
				break;

			// Update command
			case MessageTypeWord.Update:
				processLog({ error: new Error(`Update started`), level: LogLevel.Info });
				shardArgs = commsShardRawToArgs(message.body as CommsShardRaw);
				this.universe.getShard(shardArgs).update(shardArgs);
				break;

			// Continue loop on default
			default:
				processLog({ error: new Error(`Unknown message type: "${message.type}"`), level: LogLevel.Info });
		}
	}

	// Return
	return false;
};
