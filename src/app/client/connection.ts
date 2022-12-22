/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { Howl } from "howler";
import { DeferredPromise } from "../common/async";
import { MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ClientUpdate } from "../comms";
import {
	CoreConnection,
	CoreConnectionConstructorParams,
	Envelope,
	Message,
	ProcessCallback,
	VSocket
} from "../core/connection";
import { LogLevel } from "../core/error";
import { CoreShardArg } from "../core/shard";
import { ClientCell } from "./cell";
import { ClientOptions } from "./options";
import { ClientShard } from "./shard";
import { ClientUniverse } from "./universe";

// Sound
/**
 * Monster death.
 */
let splat: Howl = new Howl({
	html5: true,
	sprite: {
		default: [30, 1000]
	},
	src: ["sound/effects/splattt-6295.mp3"]
});

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
							this.universe.addShard(message.body as CoreShardArg<ClientOptions>, { attachHook, created }, [], {
								doAppend: true
							});
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

				(message.body as ClientUpdate).cells.forEach(sourceCell => {
					let targetCell: ClientCell = this.universe.getCell(sourceCell);
					let sourceEntityUuidSet: Set<Uuid> = new Set(sourceCell.entities.map(entity => entity.entityUuid));

					// Terminate missing
					targetCell.entities.forEach(targetEntity => {
						if (!sourceEntityUuidSet.has(targetEntity.entityUuid)) {
							if (targetEntity.modeUuid === "mode/user/enemy/default") {
								splat.play("default");
								targetCell.removeEntity(targetEntity);
							} else if (targetEntity.modeUuid === "mode/user/player/default") {
								targetCell.detachEntity(targetEntity);
							}
						}
					});
				});

				(message.body as ClientUpdate).cells.forEach(sourceCell => {
					let targetCell: ClientCell = this.universe.getCell(sourceCell);
					// eslint-disable-next-line @typescript-eslint/typedef
					sourceCell.entities.forEach(({ entityUuid, emits }) => {
						if (typeof emits.health === "number") {
							this.universe.getEntity({ entityUuid }).health = emits.health;
						}
						// Reattach present
						if (!targetCell.entities.has(entityUuid)) {
							targetCell.attachEntity(this.universe.getEntity({ entityUuid }));
						}
					});
				});
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
