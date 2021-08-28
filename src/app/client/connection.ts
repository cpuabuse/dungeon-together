/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import * as typing from "io-ts";
import { MessageTypeWord, MovementWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ProcessCallback, VSocket } from "../common/vsocket";
import { CommsConnection, CommsConnectionArgs, Envelope, Message } from "../comms/connection";
import { CommsShardArgs } from "../comms/shard";
import { CoreUniverse } from "../comms/universe";
import { LogLevel, processLog } from "./error";
import { ClientUniverse } from "./universe";

/**
 * Message type descriptions.
 *
 * To extract TypeScript types, we need to use `typeof`, which cannot be used on the values of the map, thus object is preferred.
 * Due to the fact that message type keys are created by developers, there will be no conflict with inherited properties.
 * Although, during processing of incoming messages, `messageTypeKeys` should be referenced to ensure the usage of own properties.
 *
 * Even though for union literals keyof is recommended in {@link https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals | io-ts documentation}, ignoring it to preserve meaning. {@link https://github.com/microsoft/TypeScript/issues/31268 | Pull request} should introduce enums instead.
 *
 * As of now impossible to implement type predicates on class members.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const messageTypes = {
	[MessageTypeWord.Movement]: typing.type({
		direction: typing.union([
			typing.literal(MovementWord.Up),
			typing.literal(MovementWord.Down),
			typing.literal(MovementWord.Left),
			typing.literal(MovementWord.Right),
			typing.literal(MovementWord.ZUp),
			typing.literal(MovementWord.ZDown)
		])
	})
};

/**
 * Keys used to identify message types.
 */
export type messageTypeKeys = keyof typeof messageTypes;

/**
 * Message to pass about the character movements.
 */
export type MovementMessage = typing.TypeOf<typeof messageTypes[MessageTypeWord.Movement]>;

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

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Sync command
			case MessageTypeWord.Sync:
				processLog({ error: new Error(`Synchronization started`), level: LogLevel.Info });
				this.universe.addShard(message.body as CommsShardArgs);
				this.universe.getShard(message.body as CommsShardArgs).attach();
				break;

			// Continue loop on default
			default:
				processLog({ error: new Error(`Unknown message type: "${message.type}"`), level: LogLevel.Info });
		}
	}

	// Return
	return false;
};
