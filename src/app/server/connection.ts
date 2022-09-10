/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import { ClientOptions, clientOptions } from "../client/options";
import { appUrl } from "../common/defaults";
import { MessageTypeWord, MovementWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ClientUpdate } from "../comms";
import { CoreArgIds, CoreArgMeta, Nav, coreArgMetaGenerate } from "../core/arg";
import { CellPathOwn } from "../core/cell";
import {
	CoreConnection,
	CoreConnectionConstructorParams,
	Envelope,
	Message,
	ProcessCallback,
	VSocket
} from "../core/connection";
import { LogLevel } from "../core/error";
import { ActionWords } from "./action";
import { ServerCell } from "./cell";
import { ServerEntity } from "./entity";
import { ServerOptions, serverOptions } from "./options";
import { Player } from "./shard";
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

		// #if _DEBUG_ENABLED
		// For testing
		// eslint-disable-next-line no-console
		this.universe.log({ level: LogLevel.Debug, message: `Received message(type="${message.type}").` });
		// #endif

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

			case MessageTypeWord.Movement:
				/* eslint-disable no-case-declarations */
				let directions: {
					[K in MovementWord]: Nav;
				} = {
					[MovementWord.Up]: Nav.YUp,
					[MovementWord.Down]: Nav.YDown,
					[MovementWord.Left]: Nav.Left,
					[MovementWord.Right]: Nav.Right,
					[MovementWord.ZUp]: Nav.ZUp,
					[MovementWord.ZDown]: Nav.ZDown
				};
				let { playerEntity }: Player = Array.from(Array.from(this.universe.shards)[0][1].players.values())[2];
				let currentCell: ServerCell = this.universe.getCell(playerEntity);
				const { cellUuid }: CellPathOwn =
					this.universe.getCell(playerEntity).nav.get(
						directions[
							(
								message.body as {
									/**
									 * Directions.
									 */
									direction: MovementWord;
								}
							).direction
						]
					) ?? currentCell;
				let targetCell: ServerCell = this.universe.getGrid(playerEntity).getCell({ cellUuid });

				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				let enemy: ServerEntity | undefined = Array.from(targetCell.entities).filter(([, entity]) => {
					return entity.kindUuid === "user/enemy";
				})[0]?.[1];
				/* eslint-enable no-case-declarations */
				// Quick fix for switch
				// eslint-disable-next-line no-case-declarations
				let enemyEvent: ClientUpdate["cells"][number]["events"][number] | undefined;

				if (enemy) {
					enemyEvent = { name: "death", target: { entityUuid: enemy.entityUuid } };
					// Terminating first so that uuid doesn't exist anymore
					enemy.kind.action({ action: ActionWords.Attack });
				} else {
					playerEntity.kind.moveEntity(targetCell);
				}

				// Quick fix for switch
				// eslint-disable-next-line no-case-declarations
				let messageBody: ClientUpdate = {
					cells: [
						// Target cell
						{
							cellUuid: targetCell.cellUuid,
							entities: Array.from(targetCell.entities)
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								.filter(([entityUuid]) => {
									return entityUuid !== targetCell.defaultEntity.entityUuid;
								})
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								.map(([entityUuid]) => {
									return { entityUuid };
								}),
							events: enemyEvent ? [enemyEvent] : []
						},

						// Current cell
						{
							cellUuid: currentCell.cellUuid,
							entities: Array.from(currentCell.entities)
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								.filter(([entityUuid]) => {
									return entityUuid !== targetCell.defaultEntity.entityUuid;
								})
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								.map(([entityUuid]) => {
									return { entityUuid };
								}),
							events: []
						}
					]
				};

				// Await is inside of the loop, but also the switch
				// eslint-disable-next-line no-await-in-loop
				await this.send({
					envelope: new Envelope({
						messages: [
							{
								body: messageBody,
								type: MessageTypeWord.Update
							}
						]
					})
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
