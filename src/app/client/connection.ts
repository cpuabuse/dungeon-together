/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { join } from "path";
import { Howl } from "howler";
import nextTick from "next-tick";
import { ColorMatrixFilter, Container } from "pixi.js";
import { DeferredPromise } from "../common/async";
import { DirectionWord, MessageTypeWord, vSocketMaxDequeue } from "../common/defaults/connection";
import { env } from "../common/env";
import { defaultFadeInMs, defaultFadeOutMs } from "../common/sound";
import { Uuid } from "../common/uuid";
import { Vector, defaultVector } from "../common/vector";
import { ClientUpdate } from "../comms";
import { Nav, NavIndexValue, navIndex } from "../core/arg";
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
import { ModuleLocaleMessagesRegistry, ModuleLocalePartialMessages } from "../core/module";
import { CoreShardArg, ShardPathOwn } from "../core/shard";
import { ActionWords } from "../server/action";
import { CellEvent } from "../server/cell";
import { ServerMessage } from "../server/connection";
import { Store, StoreWord } from "../vue/core/store";
import { ClientCell } from "./cell";
import { ClientEntity } from "./entity";
import { FowWords } from "./fow";
import { ClientGrid } from "./grid";
import { ClientOptions } from "./options";
import { ClientShard } from "./shard";
import { uuidToName } from "./text";
import { ClientToast } from "./toast";
import { ClientUniverse } from "./universe";

/**
 * Burn.
 */
const contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();
contrastFilter.contrast(1.0, false);

/**
 * Story notification type.
 */
export type StoryNotification = {
	/**
	 * Notification ID.
	 */
	notificationId: string;

	/**
	 * Module ID.
	 */
	moduleName: string;

	/**
	 * Notification parameters.
	 */
	parameters?: Array<string | number>;
};

/**
 * Status notification payload.
 */
export type StatusNotification = {
	/**
	 * Notification ID.
	 */
	notificationId: string;

	/**
	 * Notification parameters.
	 */
	notificationParameters?: Record<string, string | number>;
};

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

					/**
					 * Messages from server.
					 */
					messages: ModuleLocaleMessagesRegistry;
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
			body: CoreMessagePlayerBody & StatusNotification;
	  }
	| {
			/**
			 * Story notification.
			 */
			type: MessageTypeWord.StoryNotification;

			/**
			 * Message body.
			 */
			body: CoreMessagePlayerBody & StoryNotification;
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
	src: [join(env.pathToRoot, "sound/effects/splattt-6295.mp3")]
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
	 * Player name for display.
	 *
	 * @returns Player name
	 */
	public get playerName(): string {
		// TODO: Add player dictionary sync
		return uuidToName({ uuid: this.playerUuid });
	}

	/**
	 * Client connection.
	 */
	public connection?: ClientConnection = undefined;

	/**
	 * Notification ID array.
	 */
	// False negative
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	public statusNotifications: Array<StatusNotification> = new Array();

	public storyNotifications: Array<StoryNotification> = new Array<StoryNotification>();
}

// TODO: Either make sure that grids and cells do not get changed between cycles or write an appropriate documentation
/**
 * Type to track cells between cycles.
 */
type VisibilityMap = Map<
	Uuid,
	{
		/**
		 * Cell.
		 */
		cell: ClientCell;

		/**
		 * Grid.
		 */
		grid: ClientGrid;
	}
>;

/**
 * Client connection.
 */
export class ClientConnection extends CoreConnection<ClientUniverse, ClientMessage, ServerMessage, ClientPlayer> {
	public previouslyVisibleCellEntries: VisibilityMap = new Map();

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
	const universeStore: Store<StoreWord.Universe> = this.universe.stores.useUniverseStore();

	/**
	 * Updates dictionary container.
	 *
	 * @remarks
	 * Rewrites the object on purpose, and other components depend on this behavior.
	 *
	 * @param param - Destructured parameter
	 */
	// Infer arrow function type, inherit `this`
	// eslint-disable-next-line @typescript-eslint/typedef
	const updateDictionaryContainer = ({
		dictionaryContainer,
		dictionary
	}: {
		/**
		 * Target container of dictionary.
		 */
		dictionaryContainer: Record<"dictionary", CoreDictionary>;

		/**
		 * Source Dictionary.
		 */
		dictionary: CoreDictionary;
		// False negative
		// eslint-disable-next-line @typescript-eslint/typedef
	}): void => {
		// Iterating through keys to prevent assignment of objects for standalone
		let newDictionary: CoreDictionary = {};
		Object.keys(dictionary).forEach(key => {
			// Undefined values will produce key
			let entry: CoreDictionary[any] | undefined = dictionary[key];
			if (Array.isArray(entry)) {
				// Casting, since array expansion is producing an array of union, instead of union of arrays
				newDictionary[key] = [...entry] as Extract<CoreDictionary[any], Array<any>>;
			} else if (typeof entry === "object") {
				newDictionary[key] = { ...entry };
			} else if (typeof entry !== "undefined") {
				newDictionary[key] = entry;
			}
		});
		dictionaryContainer.dictionary = newDictionary;
	};

	// Message reading loop
	let counter: number = 0;
	let results: Array<Promise<void>> = new Array<Promise<void>>();

	while (counter++ < vSocketMaxDequeue) {
		let errorResult: Error | null = null;

		// Get message
		const message: ClientMessage = this.socket.readQueue();

		// Switch message type
		switch (message.type) {
			// Queue is empty
			case MessageTypeWord.Empty:
				return true;

			// Status notification update
			case MessageTypeWord.StatusNotification: {
				this.getPlayerEntry(message.body)?.player.statusNotifications.push(message.body);
				universeStore.updateStatusNotification();
				break;
			}

			// Story notification update
			case MessageTypeWord.StoryNotification: {
				let player: ClientPlayer | undefined = this.getPlayerEntry(message.body)?.player;
				if (player) {
					player.storyNotifications.push(message.body);
					universeStore.updateStoryNotification();
				} else {
					errorResult = new Error(`"Player(playerUuid="${message.body.playerUuid}") not found.`);
				}
				break;
			}

			// Sync command
			case MessageTypeWord.Sync: {
				this.universe.log({
					level: LogLevel.Informational,
					message: `Synchronization started`
				});

				// Before anything, sync the messages
				// ESLint false negative
				// eslint-disable-next-line @typescript-eslint/typedef
				Object.entries(message.body.messages).forEach(([moduleName, messagesEntry]) => {
					if (messagesEntry) {
						// ESLint false negative
						// eslint-disable-next-line @typescript-eslint/typedef
						Object.entries(messagesEntry).forEach(([language, msg]) => {
							// The library does not support partial schemas, so actual schema is non partial, and we cannot check if this object satisfies it or not, since it is partial, so to do type checking, need to be careful and use runtime checks when translating, also make sure that modules correctly define it's translations
							this.universe.i18n.global.mergeLocaleMessage(language, {
								module: {
									[moduleName]: msg
								} satisfies ModuleLocalePartialMessages
							});
						});
					}
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
									const player: ClientPlayer | undefined = shard.players.get(message.body.playerUuid);

									message.body.units.forEach(unitUuid => {
										shard.units.add(unitUuid);
										if (player) {
											player.units.add(unitUuid);
										}
									});

									if (player) {
										updateDictionaryContainer({ dictionary: message.body.dictionary, dictionaryContainer: player });
									} else {
										this.universe.log({
											error: new Error(
												`"Sync" callback failed, player("playerUuid=${message.body.playerUuid}") not found in shard("shardUuid=${shard.shardUuid}").`
											),
											level: LogLevel.Error
										});
									}
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

				// Finally notify state
				universeStore.updatePlayerDictionary();
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
				let newCellEntries: VisibilityMap = new Map();

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
					this.universe.universeQueue.addCallback({
						/**
						 * Callback.
						 */
						callback: () => {
							let sourceEntityUuidSet: Set<Uuid> = new Set(sourceCell.entities.map(entity => entity.entityUuid));
							let targetCell: ClientCell = this.universe.getCell(sourceCell);
							let targetGrid: ClientGrid = this.universe.getGrid(sourceCell);

							// TODO: Visibility tracing
							newCellEntries.set(sourceCell.cellUuid, { cell: targetCell, grid: targetGrid });
							let levelContainer: Container | undefined =
								targetGrid.levelIndex[targetCell.z]?.containers[FowWords.White];
							if (levelContainer) {
								levelContainer.addChild(targetCell.container);
							} else {
								this.universe.log({
									error: new Error("Could not find cell container"),
									level: LogLevel.Error
								});
							}

							// Detach
							targetCell.entities.forEach(targetEntity => {
								// TODO: Check should be by object not by UUID, right now sync is sending server initial bunnies, which overwrite client bunnies, so sync needs to be rework not to do that
								if (
									targetCell.defaultEntity.entityUuid !== targetEntity.entityUuid &&
									!sourceEntityUuidSet.has(targetEntity.entityUuid)
								) {
									targetCell.detachEntity(targetEntity);
									detachedEntities.add([targetEntity, sourceCell, targetCell]);
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
								// Iterating through keys to prevent assignment of objects for standalone
								Object.keys(emits).forEach(key => {
									let entry: CoreDictionary[any] | undefined = emits[key];
									if (Array.isArray(entry)) {
										// Casting, since array expansion is producing an array of union, instead of union of arrays
										entity.dictionary[key] = [...entry] as Extract<CoreDictionary[any], Array<any>>;
									} else if (typeof entry === "object") {
										entity.dictionary[key] = { ...entry };
									} else if (typeof entry !== "undefined") {
										entity.dictionary[key] = entry;
									}
								});

								entity.onUpdateDictionary();

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

				// Cell events
				message.body.cells.forEach(sourceCell => {
					if (sourceCell.events.length > 0 && sourceCell.events[0]?.name === "death") {
						let targetCell: ClientCell = this.universe.getCell(sourceCell);

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
					}
				});

				// Mirage and phantom
				this.universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						if (detachedEntities.size > 0) {
							// Cache source cell UUIDs for reuse optiomization
							const sourceCellUuids: Set<Uuid> = new Set(message.body.cells.map(cell => cell.cellUuid));

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

									// Process death if event was there or in trail location
									if (
										[
											...sourceCell.events,

											// We would be here, if trail was not for phantom
											...(trailEvent
												? // Assert trail event, as it will not change during `find()`, and is conditionally asserted right above
													// ESLint does not infer
													// eslint-disable-next-line @typescript-eslint/typedef
													message.body.cells.find(({ cellUuid }) => cellUuid === trailEvent!.targetCellUuid)?.events ??
													[]
												: [])
										].some(event => event.name === "death" && event.targetEntityUuid === entity.entityUuid)
									) {
										// Death has been verified, so we can at least clean up some entities
										targetCell.removeEntity(entity);
									}

									// Process phantom, when applicable
									else if (trailEvent && !sourceCellUuids.has(trailEvent.targetCellUuid)) {
										// Trail the next location
										this.universe.getCell({ cellUuid: trailEvent.targetCellUuid }).attachEntity(entity);
									}

									// If we cannot terminate it, or show it somewhere else on the screen, show mirage in case of no event move, or rerendering past visited cell
									else {
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
					}
				});

				// Fog
				this.universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						// ESLint does not infer
						// eslint-disable-next-line @typescript-eslint/typedef
						this.previouslyVisibleCellEntries.forEach(({ cell, grid }, cellUuid) => {
							if (!newCellEntries.has(cellUuid)) {
								let levelContainer: Container | undefined = grid.levelIndex[cell.z]?.containers[FowWords.Grey];
								if (levelContainer) {
									levelContainer.addChild(cell.container);
								} else {
									this.universe.log({
										error: new Error("Could not find cell container"),
										level: LogLevel.Error
									});
								}
							}
						});
						this.previouslyVisibleCellEntries = newCellEntries;
					}
				});

				// Finally notify state
				this.universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						universeStore.updateEntityDictionary();
					}
				});

				// TODO: Should be using a different action
				// Finally notify state
				universeStore.updatePlayerDictionary();

				break;
			}

			// Received from client
			case MessageTypeWord.Movement: {
				let isActionNotDispatched: boolean = true;

				// Extract from body
				let { unitUuid, playerUuid }: typeof message.body = message.body;
				let direction: MovementWord | undefined;
				if (message.body.hasDirection) {
					direction = message.body.direction;
				}

				let controlUnit: ClientEntity = this.universe.getEntity({ entityUuid: unitUuid });

				// TODO: Change to string to uuid conversion function
				// Destructuring won't be compatible with record type
				// eslint-disable-next-line prefer-destructuring
				let gridUuid: any = controlUnit.dictionary.gridUuid;
				if (typeof gridUuid === "string") {
					let grid: ClientGrid = this.universe.getGrid({ gridUuid });
					let { x, y, z }: CoreDictionary = { ...controlUnit.dictionary };

					if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
						let vectorChange: Vector = defaultVector;
						if (direction) {
							let indexedVectorChange: NavIndexValue | undefined = navIndex.get(directions[direction]);
							if (indexedVectorChange) {
								vectorChange = indexedVectorChange;
							}
						}
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
														direction,
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
			default: {
				// @ts-expect-error Union should exhaust
				// DIsabling ESLint, since errors expected
				// eslint-disable-next-line
				let type: string = message.type;
				errorResult = new Error(`Unknown message type(type="${type}").`);
			}
		}

		if (errorResult) {
			this.universe.log({
				error: new Error(`Queue callback(message.type="${message.type}") failed.`, { cause: errorResult }),
				level: LogLevel.Warning
			});
		}
	}

	await Promise.all(results);

	// Return
	return false;
};
