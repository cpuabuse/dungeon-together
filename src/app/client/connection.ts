/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { DeferredPromise } from "../common/async";
import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import {
	CoreConnection,
	CoreConnectionConstructorParams,
	Envelope,
	Message,
	ProcessCallback,
	VSocket
} from "../core/connection";
import { LogLevel, processLog } from "../core/error";
import { CoreShardArg } from "../core/shard";
import { ClientOptions } from "./options";
import { ClientShard } from "./shard";
import { ClientUniverse } from "./universe";

/**
 * Client connection.
 */
export class ClientConnection implements CoreConnection<ClientUniverse> {
	/**
	 * Client UUIDs.
	 */
	public shardUuids: Set<Uuid> = new Set();

	/**
	 * The target, be it standalone, remote or absent.
	 */
	public socket: VSocket<ClientUniverse>;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({ socket }: CoreConnectionConstructorParams<ClientUniverse>) {
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
		let attachHook: Promise<void>;
		let created: DeferredPromise<void>;

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Sync command
			case MessageTypeWord.Sync:
				processLog({ error: new Error(`Synchronization started`), level: LogLevel.Info });
				created = new DeferredPromise();
				// Await is not performed, as it should not block queue, and it should already be guaranteed to be sequential
				attachHook = new Promise<void>((resolve, reject) => {
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							this.universe.addShard(message.body as CoreShardArg<ClientOptions>, { attachHook, created }, []);
							created
								.catch(error => {
									// TODO: Handle error
									reject(error);
								})
								.finally(() => {
									resolve();
								});
						}
					});
				});
				shard = this.universe.getShard(message.body as CoreShardArg<ClientOptions>);
				shard.addSocket({ socket: this });
				break;

			// Update command
			case MessageTypeWord.Update:
				processLog({ error: new Error(`Update started`), level: LogLevel.Info });
				// TODO: Handle update
				break;

			// Continue loop on default
			default:
				processLog({ error: new Error(`Unknown message type: "${message.type}"`), level: LogLevel.Info });
		}
	}

	// Return
	return false;
};
