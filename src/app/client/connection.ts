/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { Howl } from "howler";
import nextTick from "next-tick";
import { ColorMatrixFilter } from "pixi.js";
import { DeferredPromise } from "../common/async";
import { DirectionWord, MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { defaultFadeInMs, defaultFadeOutMs } from "../common/sound";
import { Uuid } from "../common/uuid";
import { Vector, defaultVector } from "../common/vector";
import { ClientUpdate } from "../comms";
import { Nav, navIndex } from "../core/arg";
import {
	CoreConnection,
	CoreConnectionArgs,
	CoreDictionary,
	CoreEnvelope,
	CoreMessageEmpty,
	CoreMessageMovement,
	CoreMessagePlayerBody,
	CorePlayer,
	CoreProcessCallback,
	CoreScheduler,
	MovementWord,
	ToSuperclassCoreProcessCallback,
	processInitWord
} from "../core/connection";
import { LogLevel } from "../core/error";
import { CoreShardArg, ShardPathOwn } from "../core/shard";
import { ActionWords } from "../server/action";
import { CellEvent } from "../server/cell";
import { ServerMessage } from "../server/connection";
import { ClientCell } from "./cell";
import { ClientEntity } from "./entity";
import { ClientGrid } from "./grid";
import { ClientOptions } from "./options";
import { ClientShard } from "./shard";
import { ClientToast } from "./toast";
import { ClientUniverse } from "./universe";

/**
 * Burn.
 */
const contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();
contrastFilter.contrast(1.0, false);

/**
 * Message type client receives.
 */
export type ClientMessage =
	| CoreMessageEmpty
	| {
			/**
			 * Message body.
			 */
			body: CoreMessagePlayerBody &
				CoreShardArg<ClientOptions> & {
					/**
					 * Unit Uuids.
					 */
					units: Array<Uuid>;

					/**
					 * Player dictionary.
					 */
					dictionary: CoreDictionary;
				};

			/**
			 * Message type.
			 */
			type: MessageTypeWord.Sync;
	  }
	| {
			/**
			 * Client update body.
			 */
			body: ClientUpdate;

			/**
			 * Update type.
			 */
			type: MessageTypeWord.Update;
	  }
	| CoreMessageMovement
	| {
			/**
			 * Local action body.
			 */
			body: {
				/**
				 * Player UUID.
				 */
				playerUuid: Uuid;

				/**
				 * Unit UUID.
				 */
				unitUuid: Uuid;
			};

			/**
			 * Local action type.
			 */
			type: MessageTypeWord.LocalAction;
	  }
	| {
			/**
			 * Local action type.
			 */
			type: MessageTypeWord.StatusNotification;

			/**
			 * Message body.
			 */
			body: CoreMessagePlayerBody & {
				/**
				 * Notification ID.
				 */
				notificationId: string;
			};
	  };

// Sound
/**
 * Monster death.
 */
let splat: Howl = new Howl({
	html5: true,
	sprite: {
		default: [defaultFadeInMs, defaultFadeOutMs]
	},
	src: ["/sound/effects/splattt-6295.mp3"]
});

// Allowed directions
/**
 * Directions mapping to movement.
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
 * Client player.
 */
export class ClientPlayer extends CorePlayer<ClientConnection> {
	/**
	 * Client connection.
	 */
	public connection?: ClientConnection = undefined;

	/**
	 * Notification ID array.
	 */
	// False negative
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	public notificationIds: Array<string> = new Array();
}

/**
 * Client connection.
 */
export class ClientConnection extends CoreConnection<ClientUniverse, ClientMessage, ServerMessage, ClientPlayer> {
	public previouslyVisibleCells: Set<ClientCell> = new Set();

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({
		universe,
		socket,
		connectionUuid
	}: Omit<CoreConnectionArgs<ClientUniverse, ClientMessage, ServerMessage>, "callback">) {
		super({
			callback: queueProcessCallback as ToSuperclassCoreProcessCallback<
				typeof queueProcessCallback,
				CoreConnection<ClientUniverse, ClientMessage, ServerMessage>
			>,
			connectionUuid,
			socket,
			universe
		});

		this.addProcess({
			callback: initProcessCallback as ToSuperclassCoreProcessCallback<typeof queueProcessCallback, CoreScheduler>,
			word: processInitWord
		});
	}

	/**
	 * Calls for each shard.
	 *
	 * @param callback - Callback
	 * @returns Array of return values
	 */
	public forEachShard<Return>(callback: (shard: ClientShard) => Return): Array<Return> {
		return Array.from(this.shardUuids).map(shardUuid => callback(this.universe.getShard({ shardUuid })));
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
		let shard: ClientShard = this.universe.getShard({ shardUuid });
		shard.players.set(playerUuid, new ClientPlayer({ playerUuid }));
		return super.registerShard({ playerUuid, shardUuid });
	}
}

/**
 * Callback for sync.
 *
 * @param this - Socket
 * @returns Promise with `true`
 */
export const initProcessCallback: CoreProcessCallback<ClientConnection> = async function () {
	await this.socket.send(new CoreEnvelope({ messages: [{ body: null, type: MessageTypeWord.Sync }] }));
	return true;
};

/**
 * Queue process callback for socket.
 *
 * @returns `true` if the callback was processed, `false` if additional processing is required
 */
// Has to be async to work with VSocket
// eslint-disable-next-line @typescript-eslint/require-await
export const queueProcessCallback: CoreProcessCallback<ClientConnection> = async function () {
	// Message reading loop
	let counter: number = 0;
	let results: Array<Promise<void>> = new Array<Promise<void>>();

	while (counter++ < vSocketMaxDequeue) {
		// Get message
		const message: ClientMessage = this.socket.readQueue();

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Status notification update
			case MessageTypeWord.StatusNotification: {
				this.getPlayerEntry(message.body)?.player.notificationIds.push(message.body.notificationId);
				break;
			}

			// Sync command
			case MessageTypeWord.Sync: {
				this.universe.log({
					level: LogLevel.Informational,
					message: `Synchronization started`
				});

				let created: DeferredPromise<void> = new DeferredPromise();
				// Await is not performed, as it should not block queue, and it should already be guaranteed to be sequential
				let attachHook: Promise<void> = new Promise<void>((resolve, reject) => {
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							let shard: ClientShard = this.universe.addShard(message.body, { attachHook, created }, [], {
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

							// Will be added after all attach registrations added within `addShard`
							attachHook
								.then(() => {
									this.registerShard({ playerUuid: message.body.playerUuid, shardUuid: message.body.shardUuid });
									message.body.units.forEach(unitUuid => {
										shard.units.add(unitUuid);
									});

									// TODO: Move object link verification to standalone connection
									// Iterating through keys to prevent assignment of objects for standalone
									Object.keys(message.body.dictionary).forEach(key => {
										let entry: CoreDictionary[any] | undefined = message.body.dictionary[key];
										let player: ClientPlayer | undefined = shard.players.get(message.body.playerUuid);
										if (player) {
											if (Array.isArray(entry)) {
												// Casting, since array expansion is producing an array of union, instead of union of arrays
												player.dictionary[key] = [...entry] as Extract<CoreDictionary[any], Array<any>>;
											} else if (typeof entry === "object") {
												player.dictionary[key] = { ...entry };
											} else if (entry) {
												player.dictionary[key] = entry;
											}
										} else {
											this.universe.log({
												error: new Error(
													`"Sync" callback failed, player("playerUuid=${message.body.playerUuid}") not found in.`
												),
												level: LogLevel.Error
											});
										}
									});
								})
								.catch(error => {
									this.universe.log({
										error: new Error(
											`"Sync" callback failed trying to add shard("shardUuid=${message.body.shardUuid}") to player("playerUuid=${message.body.playerUuid}").`,
											{ cause: error instanceof Error ? error : undefined }
										),
										level: LogLevel.Error
									});
								});
						}
					});
				});

				// Await not only attach hook, but also registered callbacks coming after attach hook
				// Treating as switch block rather than part of loop
				// eslint-disable-next-line no-await-in-loop
				await attachHook;
				// Treating as switch block rather than part of loop
				// eslint-disable-next-line no-await-in-loop
				await Promise.resolve();

				break;
			}

			// Update command
			case MessageTypeWord.Update: {
				/**
				 * Cell type in update.
				 */
				type UpdateCell = typeof message.body.cells extends Array<infer Cell> ? Cell : never;
				let detachedEntities: Set<[ClientEntity, UpdateCell, ClientCell]> = new Set();
				let attachedEntities: Set<ClientEntity> = new Set();
				let newCells: Set<ClientCell> = new Set();

				this.universe.log({ level: LogLevel.Informational, message: `Update started.` });
				// Create cells if missing
				message.body.cells.forEach(sourceCell => {
					let targetCell: ClientCell = this.universe.getCell(sourceCell);

					if (targetCell.cellUuid !== sourceCell.cellUuid) {
						let created: DeferredPromise<void> = new DeferredPromise();

						let attachHook: Promise<void> = new Promise<void>((resolve, reject) => {
							this.universe.universeQueue.addCallback({
								/**
								 * Callback.
								 */
								callback: () => {
									this.universe.getGrid(sourceCell).addCell(
										{
											cellUuid: sourceCell.cellUuid,
											entities: new Map(),
											x: sourceCell.x,
											y: sourceCell.y,
											z: sourceCell.z
										},
										{ attachHook, created },
										[]
									);
									created
										.catch(error => {
											reject(
												new Error(
													`"Update" callback failed trying to add shard in universe with uuid "${this.universe.universeUuid}".`,
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

						this.universe.universeQueue.sync({
							/**
							 * Callback.
							 */
							promise: attachHook
						});
					}
				});

				// Detach
				message.body.cells.forEach(sourceCell => {
					let sourceEntityUuidSet: Set<Uuid> = new Set(sourceCell.entities.map(entity => entity.entityUuid));
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							let targetCell: ClientCell = this.universe.getCell(sourceCell);

							// TODO: Visibility tracing
							newCells.add(targetCell);
							targetCell.container.filters = [];

							// Terminate missing
							targetCell.entities.forEach(targetEntity => {
								if (!sourceEntityUuidSet.has(targetEntity.entityUuid)) {
									// TODO: Move death to cell events
									if (targetEntity.modeUuid === "mode/user/enemy/default" || targetEntity.modeUuid === "mimic-attack") {
										if (
											sourceCell.events.length > 0 &&
											sourceCell.events[0]?.targetEntityUuid === targetEntity.entityUuid &&
											sourceCell.events[0]?.name === "death"
										) {
											splat.play("default");

											let toast: ClientToast = new ClientToast({
												cell: targetCell,
												displayTime: 1000
											});

											// TODO: Should not be using shard
											toast.show({
												modeUuid: "death",
												x: 0,
												y: 0,
												z: 0
											});

											targetCell.removeEntity(targetEntity);
										} else {
											targetCell.detachEntity(targetEntity);
											detachedEntities.add([targetEntity, sourceCell, targetCell]);
										}
									} else if (targetEntity.modeUuid === "mode/user/player/default") {
										targetCell.detachEntity(targetEntity);
										detachedEntities.add([targetEntity, sourceCell, targetCell]);
									}
								}
							});
						}
					});
				});

				// Attach
				message.body.cells.forEach(sourceCell => {
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							let targetCell: ClientCell = this.universe.getCell(sourceCell);
							// eslint-disable-next-line @typescript-eslint/typedef
							sourceCell.entities.forEach(({ entityUuid, emits, modeUuid, worldUuid }) => {
								let entity: ClientEntity = this.universe.getEntity({ entityUuid });
								// TODO: Must do date update when entities exist, not before creation
								// TODO: Move object link verification to standalone connection
								// Iterating through keys to prevent assignment of objects for standalone
								Object.keys(emits).forEach(key => {
									let entry: CoreDictionary[any] | undefined = emits[key];
									if (Array.isArray(entry)) {
										// Casting, since array expansion is producing an array of union, instead of union of arrays
										entity.dictionary[key] = [...entry] as Extract<CoreDictionary[any], Array<any>>;
									} else if (typeof entry === "object") {
										entity.dictionary[key] = { ...entry };
									} else if (entry) {
										entity.dictionary[key] = entry;
									}
								});

								if (typeof emits.health === "number") {
									this.universe.getEntity({ entityUuid }).health = emits.health;
								}

								// Reattach present
								if (!targetCell.entities.has(entityUuid)) {
									if (this.universe.getEntity({ entityUuid }).entityUuid !== entityUuid) {
										let created: DeferredPromise<void> = new DeferredPromise();

										let attachHook: Promise<void> = new Promise<void>((resolve, reject) => {
											this.universe.universeQueue.addCallback({
												/**
												 * Callback.
												 */
												callback: () => {
													targetCell.addEntity(
														{
															entityUuid,
															modeUuid,
															worldUuid
														},
														{ attachHook, created },
														[]
													);
													created
														.catch(error => {
															reject(
																new Error(
																	`"Update" callback failed trying to add shard in universe with uuid "${this.universe.universeUuid}".`,
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

										this.universe.universeQueue.sync({
											/**
											 * Callback.
											 */
											promise: attachHook
										});
									} else {
										// Register reattached
										attachedEntities.add(this.universe.getEntity({ entityUuid }));

										// TODO: Delay now, need to refactor attachment block
										nextTick(() => {
											targetCell.attachEntity(this.universe.getEntity({ entityUuid }));
										});
									}
								}
							});
						}
					});
				});

				// Update modes
				message.body.cells.forEach(sourceCell => {
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							// Update modes
							sourceCell.entities.forEach(sourceEntity => {
								let targetEntity: ClientEntity = this.universe.getEntity(sourceEntity);
								if (sourceEntity.modeUuid !== targetEntity.modeUuid) {
									targetEntity.modeUuid = sourceEntity.modeUuid;
									targetEntity.sprite.textures = this.universe.getMode({ uuid: sourceEntity.modeUuid }).textures;
								}
							});
						}
					});
				});

				// Mirage and phantom
				this.universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						// ESLint false negative
						// eslint-disable-next-line @typescript-eslint/typedef
						detachedEntities.forEach(([entity, sourceCell, targetCell]) => {
							// `entity.isInUniverse` to make sure we do special effects for entities that exist
							if (!attachedEntities.has(entity) && entity.isInUniverse) {
								let trailEvent: (Record<"name", "trail"> & CellEvent) | undefined = sourceCell.events.find(event => {
									// TODO: Trail can be recursive
									return event.name === "trail" && event.targetEntityUuid === entity.entityUuid;
									// Casting since `find()` does not narrow type
								}) as (Record<"name", "trail"> & CellEvent) | undefined;

								if (trailEvent) {
									// Trail the next location
									this.universe.getCell({ cellUuid: trailEvent.targetCellUuid }).attachEntity(entity);
								} else {
									// Show mirage in case of no event move, or rerendering past visited cell
									let mirage: ClientToast = new ClientToast({
										cell: targetCell,
										displayTime: 1000
									});
									mirage.show({
										isFloating: false,
										modeUuid: entity.modeUuid,
										x: 0,
										y: 0,
										z: 0
									});
								}
							}
						});
					}
				});

				// Fog
				this.universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						this.previouslyVisibleCells.forEach(cell => {
							if (!newCells.has(cell)) {
								cell.container.filters = [contrastFilter];
							}
						});
						this.previouslyVisibleCells = newCells;
					}
				});
				break;
			}

			// Received from client
			case MessageTypeWord.Movement: {
				let isActionNotDispatched: boolean = true;

				let { direction, unitUuid, playerUuid }: typeof message.body = message.body;
				let controlUnit: ClientEntity = this.universe.getEntity({ entityUuid: unitUuid });

				// TODO: Change to string to uuid conversion function
				// Destructuring won't be compatible with record type
				// eslint-disable-next-line prefer-destructuring
				let gridUuid: any = controlUnit.dictionary.gridUuid;
				if (typeof gridUuid === "string") {
					let grid: ClientGrid = this.universe.getGrid({ gridUuid });
					let { x, y, z }: CoreDictionary = { ...controlUnit.dictionary };

					if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
						let vectorChange: Vector = navIndex.get(directions[direction]) ?? defaultVector;
						let targetCell: ClientCell | undefined;

						// If cell empty, target cell will be undefined
						targetCell = grid.cellIndex[z + vectorChange.z]?.[x + vectorChange.x]?.[y + vectorChange.y];

						if (targetCell) {
							let targetEntity: ClientEntity | undefined = Array.from(targetCell.entities).find(
								// ESLint false negative
								// eslint-disable-next-line @typescript-eslint/typedef
								([, entity]) => entity.dictionary.hasAction
							)?.[1];
							if (targetEntity) {
								results.push(
									this.socket.send(
										new CoreEnvelope({
											messages: [
												{
													body: {
														controlUnitUuid: unitUuid,
														direction: message.body.direction,
														playerUuid,
														targetEntityUuid: targetEntity.entityUuid,
														type: ActionWords.Interact
													},
													type: MessageTypeWord.EntityAction
												}
											]
										})
									)
								);

								isActionNotDispatched = false;
							}
						}
					}
				}

				if (isActionNotDispatched) {
					results.push(
						this.socket.send(new CoreEnvelope({ messages: [{ body: message.body, type: MessageTypeWord.Movement }] }))
					);
				}

				break;
			}

			// Client to client local action process
			case MessageTypeWord.LocalAction: {
				let { unitUuid, playerUuid }: typeof message.body = message.body;
				let controlUnit: ClientEntity = this.universe.getEntity({ entityUuid: unitUuid });

				// TODO: Change to string to uuid conversion function
				// Destructuring won't be compatible with record type
				// eslint-disable-next-line prefer-destructuring
				let gridUuid: any = controlUnit.dictionary.gridUuid;
				if (typeof gridUuid === "string") {
					let grid: ClientGrid = this.universe.getGrid({ gridUuid });
					let { x, y, z }: CoreDictionary = { ...controlUnit.dictionary };

					if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
						let targetCell: ClientCell | undefined;

						// If cell empty, target cell will be undefined
						targetCell = grid.cellIndex[z]?.[x]?.[y];

						if (targetCell) {
							let targetEntity: ClientEntity | undefined = Array.from(targetCell.entities).find(
								// ESLint false negative
								// eslint-disable-next-line @typescript-eslint/typedef
								([, entity]) => entity.dictionary.hasLocalAction
							)?.[1];
							if (targetEntity) {
								results.push(
									this.socket.send(
										new CoreEnvelope({
											messages: [
												{
													body: {
														controlUnitUuid: unitUuid,
														direction: DirectionWord.Here,
														playerUuid,
														targetEntityUuid: targetEntity.entityUuid,
														type: ActionWords.Use
													},
													type: MessageTypeWord.EntityAction
												}
											]
										})
									)
								);
							}
						}
					}
				}
				break;
			}

			// Continue loop on default
			default:
				this.universe.log({
					level: LogLevel.Warning,
					// Casting, since if the switch is exhaustive, then type is `never`
					message: `Unknown message type(type="${(message as ClientMessage).type}").`
				});
		}
	}

	await Promise.all(results);

	// Return
	return false;
};
