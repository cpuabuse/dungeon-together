/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import { ClientOptions, clientOptions } from "../client/options";
import { appUrl } from "../common/defaults";
import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { CoreArgIds, CoreArgMeta, coreArgMetaGenerate } from "../core/arg";
import {
	CoreConnection,
	CoreConnectionConstructorParams,
	Envelope,
	Message,
	ProcessCallback,
	VSocket
} from "../core/connection";
import { LogLevel } from "../core/error";
import { ServerOptions, serverOptions } from "./options";
import { ServerUniverse } from "./universe";

/**
 * Client connection.
 */
export class ServerConnection implements CoreConnection<ServerUniverse> {
	/**
	 * Client UUIDs.
	 */
	public shardUuids: Set<Uuid> = new Set();

	/**
	 * The target, be it standalone, remote or absent.
	 */
	public socket: VSocket<ServerUniverse>;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({ socket }: CoreConnectionConstructorParams<ServerUniverse>) {
		// Set this target
		this.socket = socket;
	}
}

/**
 * Queue process callback for socket.
 *
 * @returns `true` if the callback was processed, `false` if additional processing is required
 */
export const queueProcessCallback: ProcessCallback<VSocket<ServerUniverse>> = async function () {
	let meta: CoreArgMeta<CoreArgIds.Shard, ServerOptions, ClientOptions> = coreArgMetaGenerate({
		id: CoreArgIds.Shard,
		index: 1,
		meta: {
			origin: appUrl,
			paths: {},
			systemNamespace: "system",
			userNamespace: "user"
		},
		sourceOptions: serverOptions,
		targetOptions: clientOptions
	});

	// Get temp shard data
	// Axios returns an object
	// eslint-disable-next-line @typescript-eslint/ban-types
	let shardData: object = this.universe.Shard.convertShard({
		meta,
		shard: Array.from(this.universe.shards)[1][1],
		sourceOptions: serverOptions,
		targetOptions: clientOptions
	});

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
				this.universe.log({
					level: LogLevel.Informational,
					message: `Synchronization started`
				});
				// Await is inside of the loop, but also the switch
				// eslint-disable-next-line no-await-in-loop
				await this.send({
					envelope: new Envelope({ messages: [{ body: shardData, type: MessageTypeWord.Sync }] })
				});
				break;

			// Continue loop on default
			default:
				this.universe.log({
					level: LogLevel.Informational,
					message: `Unknown message type(type="${message.type}").`
				});
		}
	}

	// Return
	return false;
};
