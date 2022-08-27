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
import { CellPathOwn } from "../core/cell";
import {
	CoreConnection,
	CoreConnectionConstructorParams,
	Envelope,
	Message,
	ProcessCallback,
	VSocket
} from "../core/connection";
import { EntityPathOwn } from "../core/entity";
import { LogLevel } from "../core/error";
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
	let results: Array<Promise<void>> = new Array<Promise<void>>();

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
				this.universe.log({
					level: LogLevel.Informational,
					message: `Synchronization started`
				});
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
									reject(
										new Error(
											`"Sync" callback failed trying to add shard in universe with uuid "${this.universe.universeUuid}".`,
											{ cause: error instanceof Error ? error : undefined }
										)
									);
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
				this.universe.log({ level: LogLevel.Informational, message: `Update started.` });
				// eslint-disable-next-line no-case-declarations
				this.universe
					.getCell(message.body as CellPathOwn)
					.attachEntity(this.universe.getEntity(message.body as EntityPathOwn));
				break;

			case MessageTypeWord.Movement:
				results.push(
					this.send({
						envelope: new Envelope({ messages: [{ body: message.body, type: MessageTypeWord.Movement }] })
					})
				);
				break;

			// Continue loop on default
			default:
				this.universe.log({
					level: LogLevel.Warning,
					// Casting, since if the switch is exhaustive, then type is `never`
					message: `Unknown message type(type="${message.type as typeof message["type"]}").`
				});
		}
	}

	await Promise.all(results);

	// Return
	return false;
};
