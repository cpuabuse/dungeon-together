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
import { CoreShardArg } from "../core/shard";
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

	let { playerEntity }: Player = Array.from(Array.from(this.universe.shards)[0][1].players.values())[2];
	let currentCell: ServerCell = this.universe.getCell(playerEntity);

	// Get temp shard data
	// Axios returns an object
	let sd: CoreShardArg<ClientOptions> = this.universe.Shard.convertShard({
		meta,
		shard: Array.from(this.universe.shards)[1][1],
		sourceOptions: serverOptions,
		targetOptions: clientOptions
	});
	// TODO: Use visibility
	sd.grids.forEach(grid => {
		grid.cells = new Map(
			[...grid.cells].filter(([cellUuid, cell]) => {
				return Math.abs(cell.x - currentCell.x) < 5 && Math.abs(cell.y - currentCell.y) < 5;
			})
		);
	});
	let shardData: object = sd;

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

				// Tick
				this.universe.Entity.kinds.forEach(Kind => {
					Kind.onTick();
				});

				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				let enemy: ServerEntity | undefined = Array.from(targetCell.entities).filter(([, entity]) => {
					return entity.kindUuid === "user/enemy";
				})[0]?.[1];
				/* eslint-enable no-case-declarations */
				// Quick fix for switch
				// eslint-disable-next-line no-case-declarations
				let enemyEvent: ClientUpdate["cells"][number]["events"][number] | undefined;

				// TODO: Entity controlled cell events
				if (enemy) {
					// Terminating first so that uuid doesn't exist anymore
					enemy.kind.action({ action: ActionWords.Attack });
					enemyEvent = { name: enemy.kind.emits.health > 0 ? "hp" : "death", target: { entityUuid: enemy.entityUuid } };
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
								.map(([entityUuid, entity]) => {
									return {
										emits: entity.kind.emits,
										entityUuid,
										modeUuid: entity.modeUuid,
										worldUuid: entity.worldUuid
									};
								}),
							events: enemyEvent ? [enemyEvent] : [],
							x: targetCell.x,
							y: targetCell.y,
							z: targetCell.z
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
								.map(([entityUuid, entity]) => {
									return {
										emits: entity.kind.emits,
										entityUuid,
										modeUuid: entity.modeUuid,
										worldUuid: entity.worldUuid
									};
								}),
							events: [],
							x: currentCell.x,
							y: currentCell.y,
							z: currentCell.z
						},

						// Rest cells
						...Array.from(this.universe.getGrid(playerEntity).cells)
							.filter(
								// TODO: Change to visibility
								([, cell]) =>
									cell.cellUuid !== targetCell.cellUuid &&
									cell.cellUuid !== currentCell.cellUuid &&
									Math.abs(cell.x - targetCell.x) < 5 &&
									Math.abs(cell.y - targetCell.y) < 5 &&
									cell.z === targetCell.z
							)
							.map(([cellUuid, cell]) => ({
								cellUuid,
								entities: Array.from(cell.entities)
									// False negative
									// eslint-disable-next-line @typescript-eslint/typedef
									.filter(([entityUuid]) => {
										return entityUuid !== cell.defaultEntity.entityUuid;
									})
									// False negative
									// eslint-disable-next-line @typescript-eslint/typedef
									.map(([entityUuid, entity]) => {
										return {
											emits: entity.kind.emits,
											entityUuid,
											modeUuid: entity.modeUuid,
											worldUuid: entity.worldUuid
										};
									}),
								events: [],
								x: cell.x,
								y: cell.y,
								z: cell.z
							}))
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
