/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import { ClientMessage } from "../client/connection";
import { ClientOptions, clientOptions } from "../client/options";
import { appUrl } from "../common/defaults";
import {
	DirectionWord,
	MessageTypeWord,
	StatusNotificationWord,
	vSocketMaxDequeue
} from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { ClientUpdate } from "../comms";
import { CoreArgIds, CoreArgMeta, Nav, coreArgMetaGenerate } from "../core/arg";
import { CellPathOwn } from "../core/cell";
import {
	CoreConnection,
	CoreConnectionArgs,
	CoreEnvelope,
	CoreMessageEmpty,
	CoreMessageMovement,
	CoreMessageSync,
	CorePlayer,
	CoreProcessCallback,
	MovementWord,
	ToSuperclassCoreProcessCallback
} from "../core/connection";
import { EntityPathExtended } from "../core/entity";
import { LogLevel } from "../core/error";
import { CoreShardArg, ShardPathOwn } from "../core/shard";
import { ActionWords } from "./action";
import { CellEvent, ServerCell } from "./cell";
import { ServerEntity } from "./entity";
import { ServerGrid } from "./grid";
import { ServerOptions, serverOptions } from "./options";
import { ServerShard } from "./shard";
import { ServerUniverse } from "./universe";

/**
 * Allowed directions.
 */
const directions: {
	[K in MovementWord]: Nav;
} = {
	[DirectionWord.Up]: Nav.YUp,
	[DirectionWord.Down]: Nav.YDown,
	[DirectionWord.Left]: Nav.Left,
	[DirectionWord.Right]: Nav.Right,
	[DirectionWord.ZUp]: Nav.ZUp,
	[DirectionWord.ZDown]: Nav.ZDown
};

/**
 * Message type server receives.
 */
export type ServerMessage =
	| CoreMessageMovement
	| CoreMessageEmpty
	| CoreMessageSync
	| {
			/**
			 * Message data.
			 */
			body: {
				/**
				 * Action.
				 */
				type: ActionWords;

				/**
				 * Direction.
				 */
				direction?: DirectionWord;

				/**
				 * Tool entity UUID.
				 */
				toolEntityUuid?: Uuid;
			} & Record<"controlUnitUuid" | "playerUuid" | "targetEntityUuid", Uuid>;

			/**
			 * Type of the message.
			 */
			type: MessageTypeWord.EntityAction;
	  };

/**
 * Server user.
 */
export interface ServerUserAlias {
	/**
	 * Name how to display the user.
	 */
	displayName: string;
}

/**
 * Server player.
 */
export class ServerPlayer extends CorePlayer<ServerConnection> {
	/**
	 * Connections to connection.
	 *
	 * @param connection - Connection to connect
	 * @returns Success
	 */
	public connect(connection: ServerConnection): boolean {
		let result: boolean = super.connect(connection);

		// Set display name in dictionary
		this.dictionary.userAliasDisplayName = connection.userAlias.displayName;

		return result;
	}
}

/**
 * Client connection.
 */
export class ServerConnection extends CoreConnection<ServerUniverse, ServerMessage, ClientMessage, ServerPlayer> {
	public userAlias: ServerUserAlias;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({
		universe,
		socket,
		connectionUuid,
		userAlias
	}: Omit<CoreConnectionArgs<ServerUniverse, ServerMessage, ClientMessage>, "callback"> &
		Record<"userAlias", ServerUserAlias>) {
		super({
			callback: queueProcessCallback as ToSuperclassCoreProcessCallback<
				typeof queueProcessCallback,
				CoreConnection<ServerUniverse, ServerMessage, ClientMessage>
			>,
			connectionUuid,
			socket,
			universe
		});

		this.userAlias = userAlias;
	}

	/**
	 * Helper function, executes callback for each shard.
	 *
	 * @param callback - Callback to execute
	 * @returns - Array of return values from callback
	 */
	public forEachShard<Return>(
		callback: ({
			shard,
			player
		}: {
			/**
			 * Server shard.
			 */
			shard: ServerShard;

			/**
			 * Server player.
			 */
			player: ServerPlayer;
		}) => Return
	): Array<Return> {
		return (
			Array.from(this.playerEntries.values())
				// ESLint false negative
				// eslint-disable-next-line @typescript-eslint/typedef
				.map(({ shardUuid, player }) => {
					return { player, shard: this.universe.getShard({ shardUuid }) };
				})
				.map(shard => {
					return callback(shard);
				})
		);
	}

	/**
	 * Helper function, executes callback for a unit.
	 *
	 * @remarks
	 * Not using universe access, to stay within shard; Moreover skipping default results, as unit is a starting point for the rest of operations.
	 *
	 * @param param - Destructured parameter
	 * @returns - Return value from callback or null
	 */
	public async forUnit<Return>({
		playerUuid,
		unitUuid,
		callback
	}: {
		/**
		 * Player UUID.
		 */
		playerUuid: Uuid;

		/**
		 * Unit UUID.
		 */
		callback: ({
			unit,
			shard,
			grid,
			cell
		}: {
			/**
			 * Unit.
			 */
			unit: ServerEntity;

			/**
			 * Shard.
			 */
			shard: ServerShard;

			/**
			 * Grid.
			 */
			grid: ServerGrid;

			/**
			 * Cell.
			 */
			cell: ServerCell;
		}) => Promise<Return>;

		/**
		 * Unit UUID.
		 */
		unitUuid: Uuid;
	}): Promise<Return | null> {
		let shardUuid: Uuid | undefined = this.playerEntries.get(playerUuid)?.shardUuid;

		if (shardUuid) {
			let shard: ServerShard | undefined = this.universe.shards.get(shardUuid);

			// If player controls unit
			if (shard?.players.get(playerUuid)?.units.has(unitUuid)) {
				let unitPath: EntityPathExtended | undefined = shard.units.get(unitUuid);
				if (unitPath) {
					let { entityUuid, cellUuid, gridUuid }: EntityPathExtended = unitPath;
					let grid: ServerGrid | undefined = shard.grids.get(gridUuid);

					if (grid) {
						let cell: ServerCell | undefined = grid.cells.get(cellUuid);

						if (cell) {
							let unit: ServerEntity | undefined = cell.entities.get(entityUuid);

							if (unit) {
								return callback({ cell, grid, shard, unit });
							}
						}
					}
				}
			}
		}

		return null;
	}

	/**
	 * Registers server shard.
	 *
	 * @param param - Shard UUID and player UUID
	 * @returns Success or not
	 */
	public registerShard({
		shardUuid,
		playerUuid
	}: {
		/**
		 * Player UUID.
		 */
		playerUuid: string;
	} & ShardPathOwn): boolean {
		return super.registerShard({ playerUuid, shardUuid });
	}
}

/**
 * Queue process callback for socket.
 *
 * @returns `true` if the callback was processed, `false` if additional processing is required
 */
export const queueProcessCallback: CoreProcessCallback<ServerConnection> = async function () {
	/**
	 * Send update.
	 *
	 * @param param - Destructured parameter
	 */
	let sendUpdate: (param: {
		/**
		 * Target cell.
		 */
		targetCell: ServerCell;

		/**
		 *  Source cell.
		 */
		sourceCell: ServerCell;

		/**
		 *  Grid.
		 */
		grid: ServerGrid;
	}) => Promise<void> = async ({
		targetCell,
		grid,
		sourceCell
	}: {
		/**
		 *  Target cell.
		 */
		targetCell: ServerCell;

		/**
		 *  Source cell.
		 */
		sourceCell: ServerCell;

		/**
		 *  Grid.
		 */
		grid: ServerGrid;
	}): Promise<void> => {
		let targetEvents: Array<CellEvent> = [...targetCell.events];
		let sourceEvents: Array<CellEvent> = [...sourceCell.events];

		// TODO: Move to lifecycle
		targetCell.clear();
		sourceCell.clear();

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
					events: targetEvents,
					gridUuid: grid.gridUuid,
					x: targetCell.x,
					y: targetCell.y,
					z: targetCell.z
				},

				// Current cell
				{
					cellUuid: sourceCell.cellUuid,
					entities: Array.from(sourceCell.entities)
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
					events: sourceEvents,
					gridUuid: grid.gridUuid,
					x: sourceCell.x,
					y: sourceCell.y,
					z: sourceCell.z
				},

				// Rest cells
				...Array.from(grid.cells)
					.filter(
						// TODO: Change to visibility
						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						([, cell]) =>
							cell.cellUuid !== targetCell.cellUuid &&
							cell.cellUuid !== sourceCell.cellUuid &&
							Math.abs(cell.x - targetCell.x) < cellViewDistance &&
							Math.abs(cell.y - targetCell.y) < cellViewDistance &&
							cell.z === targetCell.z
					)
					// False negative
					// eslint-disable-next-line @typescript-eslint/typedef
					.map(([cellUuid, cell]) => {
						let events: Array<CellEvent> = [...cell.events];
						cell.clear();

						return {
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
							events,
							gridUuid: grid.gridUuid,
							x: cell.x,
							y: cell.y,
							z: cell.z
						};
					})
			]
		};

		// Await is inside of the loop, but also the switch
		// eslint-disable-next-line no-await-in-loop
		await this.socket.send(
			new CoreEnvelope({
				messages: [
					{
						body: messageBody,
						type: MessageTypeWord.Update
					}
				]
			})
		);
	};

	// TODO: Use visibility
	const cellViewDistance: number = 5;

	// Message reading loop
	let counter: number = 0;
	while (counter++ < vSocketMaxDequeue) {
		// Get message
		const message: ServerMessage = this.socket.readQueue();

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
				{
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

					// ESLint false negative
					// eslint-disable-next-line @typescript-eslint/typedef
					let messages: Array<ClientMessage> = this.forEachShard(({ shard, player }) => {
						// Get temp shard data
						// Axios returns an object
						let body: CoreShardArg<ClientOptions> = this.universe.Shard.convertShard({
							meta,
							shard,
							sourceOptions: serverOptions,
							targetOptions: clientOptions
						});
						// ESLint false negative
						// eslint-disable-next-line @typescript-eslint/typedef
						let unitCells: Array<ServerCell> = Array.from(shard.units).map(([, unitPath]) => {
							return this.universe.getCell(unitPath);
						});
						// TODO: Use visibility
						body.grids.forEach(grid => {
							grid.cells = new Map(
								// ESLint false negative
								// eslint-disable-next-line @typescript-eslint/typedef
								[...grid.cells].map(([cellUuid, cell]) => {
									let isEntitiesIncluded: boolean = unitCells
										// ESLint false negative
										// eslint-disable-next-line @typescript-eslint/typedef
										.filter(({ gridUuid }) => gridUuid === grid.gridUuid)
										.some(
											// ESLint false negative
											// eslint-disable-next-line @typescript-eslint/typedef
											({ x, y, z }) =>
												Math.abs(cell.x - x) < cellViewDistance &&
												Math.abs(cell.y - y) < cellViewDistance &&
												cell.z === z
										);
									return [cellUuid, isEntitiesIncluded ? cell : { ...cell, entities: new Map() }];
								})
							);
						});

						return [
							{
								body: {
									...body,
									dictionary: { ...shard.dictionary, ...player?.dictionary },
									playerUuid: player.playerUuid,
									units: Array.from(shard.units)
										// ESLint false negative
										// eslint-disable-next-line @typescript-eslint/typedef
										.filter(([unitUuid]) => player?.units.has(unitUuid))
										// ESLint false negative
										// eslint-disable-next-line @typescript-eslint/typedef
										.map(([unitUuid]) => unitUuid)
								},
								type: MessageTypeWord.Sync
							},
							{
								body: { notificationId: StatusNotificationWord.Sync, playerUuid: player.playerUuid },
								type: MessageTypeWord.StatusNotification
							}
						] as const;
					}).flat();

					this.universe.log({
						level: LogLevel.Informational,
						message: `Synchronization started`
					});
					// Await is inside of the loop, but also the switch
					// eslint-disable-next-line no-await-in-loop
					await this.socket.send(new CoreEnvelope({ messages }));
				}
				break;

			case MessageTypeWord.Movement: {
				// Await is inside of the loop, but also the switch
				// eslint-disable-next-line no-await-in-loop
				await this.forUnit({
					/**
					 * Movement callback.
					 *
					 * @param unit - Unit
					 */
					// Type infers from definition; For some reason loop is detected
					// eslint-disable-next-line @typescript-eslint/typedef, no-loop-func
					callback: async ({ grid, unit, cell: sourceCell }) => {
						// Tick first, so that enemy has upper hand, and later can process ticks while awaiting player input
						this.universe.Entity.kinds.forEach(Kind => {
							Kind.onTick();
						});

						let result:
							| {
									/**
									 * Nav.
									 */
									nav: Nav;

									/**
									 * Target cell.
									 */
									targetCell: ServerCell;
							  }
							| undefined;

						let direction: MovementWord | undefined;
						let targetCellUuid: Uuid | undefined;
						if (message.body.hasDirection) {
							direction = message.body.direction;
						} else {
							targetCellUuid = message.body.targetCellUuid;
						}

						// Order requested direction to be processed first
						// Cast since `keys()` produces strings, but prototype should not influence the keys
						let orderedDirections: Array<MovementWord> = Object.keys(directions) as Array<MovementWord>;
						if (direction) {
							orderedDirections = [
								direction,
								...orderedDirections.filter(filteredDirection => filteredDirection !== direction)
							];
						}

						// Prototype inheritance ignore with `Object.values()`
						// Need to break, hence loop
						// eslint-disable-next-line no-restricted-syntax
						for (let orderedDirection of orderedDirections) {
							let targetCell: ServerCell | undefined;
							let nav: Nav = directions[orderedDirection];
							let targetCellPath: CellPathOwn | undefined = sourceCell.nav.get(nav);
							if (targetCellPath) {
								targetCell = grid.getCell(targetCellPath);
								// Verify that we found correct entity
								if (!targetCellUuid || targetCell.cellUuid === targetCellUuid) {
									result = {
										nav,
										targetCell
									};
									break;
								}
							}
						}

						if (result) {
							unit.kind.navigateEntity(result);
							await sendUpdate({ ...result, grid, sourceCell });
						} else {
							// TODO: Notify user of no result
						}
					},

					playerUuid: message.body.playerUuid,
					unitUuid: message.body.unitUuid
				});

				break;
			}

			// Entity action
			case MessageTypeWord.EntityAction: {
				// Await is inside of the loop, but also the switch
				// eslint-disable-next-line no-await-in-loop
				await this.forUnit({
					/**
					 * Callback function.
					 *
					 * @param param - Destructured parameters
					 * @returns Synchronization promise
					 */
					// ESLint false negative; For some reason detects a loop
					// eslint-disable-next-line @typescript-eslint/typedef, no-loop-func
					callback: async ({ grid, unit, cell, shard }) => {
						// Tick first, so that enemy has upper hand, and later can process ticks while awaiting player input
						this.universe.Entity.kinds.forEach(Kind => {
							Kind.onTick();
						});

						let universeObjects:
							| {
									/**
									 * Target entity.
									 */
									targetEntity: ServerEntity;

									/**
									 * Target cell.
									 */
									targetCell: ServerCell;
							  }
							| undefined;

						// Order requested direction to be processed first
						let orderedDirections: Array<DirectionWord> = Object.values(DirectionWord);
						if (message.body.direction) {
							orderedDirections = [
								message.body.direction,
								...orderedDirections.filter(direction => direction !== message.body.direction)
							];
						}

						// Prototype inheritance ignore with `Object.values()`
						// Need to break, hence loop
						// eslint-disable-next-line no-restricted-syntax
						for (let direction of orderedDirections) {
							let targetCell: ServerCell | undefined;

							if (direction === DirectionWord.Here) {
								targetCell = cell;
							} else {
								let nav: Nav = directions[direction];
								let targetCellPath: CellPathOwn | undefined = cell.nav.get(nav);
								if (targetCellPath) {
									targetCell = grid.getCell(targetCellPath);
								}
							}

							if (targetCell) {
								// Get entity from found cell
								let targetEntity: ServerEntity = targetCell.getEntity({ entityUuid: message.body.targetEntityUuid });

								// Verify that we found correct entity
								if (targetEntity.entityUuid === message.body.targetEntityUuid) {
									universeObjects = { targetCell, targetEntity };
									break;
								}
							}
						}

						if (universeObjects) {
							// TODO: Get tool entity from inventory
							let { toolEntityUuid }: typeof message.body = message.body;
							let toolEntity: ServerEntity | undefined;

							universeObjects.targetEntity.kind.action({
								action: message.body.type,
								sourceEntity: unit,
								toolEntity
							});

							await sendUpdate({ ...universeObjects, grid, sourceCell: cell });
						} else {
							// TODO: Send status update on action fail
						}
					},
					playerUuid: message.body.playerUuid,
					unitUuid: message.body.controlUnitUuid
				});
				break;
			}

			// Continue loop on default
			default:
				this.universe.log({
					level: LogLevel.Informational,
					// Casting, since exhaustiveness results in `never`
					message: `Unknown message type(type="${(message as ServerMessage).type}").`
				});
		}
	}

	// Return
	return false;
};
