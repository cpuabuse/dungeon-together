/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client universe
 */

import Hammer from "hammerjs";
import type HammerManager from "hammerjs";
import { Howl, Howler } from "howler";
import Mousetrap from "mousetrap";
import type { JoystickManager } from "nipplejs";
import joystickLib from "nipplejs";
import { utils } from "pixi.js";
import { App } from "vue";
import { Store } from "vuex";
import { DeferredPromise } from "../common/async";
import { defaultModeUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { LogLevel } from "../core/error";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, ShardPathExtended } from "../core/shard";
import { CoreUniverseClassFactory, CoreUniverseRequiredConstructorParameter } from "../core/universe";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { Stores } from "../vue/core/store";
import UniverseComponent from "../vue/pages/the-universe.vue";
import { ClientBaseClass, ClientBaseConstructorParams, ClientBaseFactory } from "./base";
import { ClientCell, ClientCellClass, ClientCellFactory } from "./cell";
import { ClientConnection } from "./connection";
import { ClientEntity, ClientEntityClass, ClientEntityFactory } from "./entity";
import { ClientGrid, ClientGridClass, ClientGridClassFactory } from "./grid";
import { ClientUniverseStateRcMenuData, UniverseState, createVueApp } from "./gui";
import { Theme } from "./gui/themes";
import {
	downSymbol,
	lcSymbol,
	leftSymbol,
	levelDownSymbol,
	levelUpSymbol,
	localActionSymbol,
	rcSymbol,
	rightSymbol,
	scrollSymbol,
	upSymbol
} from "./input";
import { ClientMode } from "./mode";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard, ClientShardClass, ClientShardFactory } from "./shard";

/**
 * Joystick create function.
 */
// Infer import destructuring
// eslint-disable-next-line @typescript-eslint/typedef
const { create: createJoystick } = joystickLib;

/**
 * All instances in client.
 *
 * Termination of the client is impossible, because it is global.
 * For same reason [[Client]] does not store "defaultInstanceUuid" inside.
 */
export class ClientUniverse extends CoreUniverseClassFactory<
	ClientBaseClass,
	ClientBaseConstructorParams,
	ClientOptions,
	ClientEntity,
	ClientCell,
	ClientGrid,
	ClientShard
>({ logSource: "Client", options: clientOptions }) {
	/**
	 * Base class.
	 */
	public readonly Base: ClientBaseClass;

	/**
	 * A shard constructor.
	 */
	public readonly Cell: ClientCellClass;

	/**
	 * A shard constructor.
	 */
	public readonly Entity: ClientEntityClass;

	/**
	 * A shard constructor.
	 */
	public readonly Grid: ClientGridClass;

	/**
	 * A shard constructor.
	 */
	public readonly Shard: ClientShardClass;

	/**
	 * Cells index.
	 */
	public readonly cellsIndex: Map<Uuid, ClientCell> = new Map();

	/**
	 * Client connections.
	 */
	public readonly connections: Map<Uuid, ClientConnection> = new Map();

	// Order is important
	/* eslint-disable @typescript-eslint/member-ordering */
	public defaultModeUuid: Uuid = defaultModeUuid;

	public defaultMode: ClientMode = new ClientMode({ modeUuid: this.defaultModeUuid });
	/* eslint-enable @typescript-eslint/member-ordering */

	public defaultShard: ClientShard;

	/**
	 * Entities index.
	 */
	public readonly entitiesIndex: Map<Uuid, ClientEntity> = new Map();

	/**
	 * Grids index.
	 */
	public readonly gridsIndex: Map<Uuid, ClientGrid> = new Map();

	/**
	 * Modes.
	 */
	public modes: Map<Uuid, ClientMode> = new Map([
		[defaultModeUuid, this.defaultMode],
		...(
			[
				["mode/user/treasure/default", ["/img/dungeontileset-ii/chest_full_open_anim_f0.png"]],
				["treasure-open", ["/img/dungeontileset-ii/chest_full_open_anim_f2.png"]],
				["mode/user/mimic/default", ["/img/dungeontileset-ii/chest_full_open_anim_f0.png"]],
				["mimic-attack", ["/img/dungeontileset-ii/chest_mimic_open_anim_f2.png"]],
				["mode/user/trap/default", ["/img/dungeontileset-ii/floor_spikes_anim_f0.png"]],
				["trap-activate", ["/img/dungeontileset-ii/floor_spikes_anim_f3.png"]],
				["mode/user/door/default", ["/img/dungeontileset-ii/doors_leaf_closed.png"]],
				["door-open", ["/img/dungeontileset-ii/doors_leaf_open.png"]],
				["mode/user/floor/default", ["/img/dungeontileset-ii/floor_1.png"]],
				["mode/user/wall/default", ["/img/rltiles/dc-dngn/wall/brick_brown2.png"]],
				["mode/user/enemy/default", ["/img/rltiles/dc-mon64/balrug.png"]],
				["mode/user/player/default", ["/img/rltiles/player/base/human_m.png"]],
				["mode/user/ladder/default", ["/img/dungeontileset-ii/floor_ladder.png"]],
				["death", ["/img/rltiles/nh-mon1/w/wraith.png"]]
			] as Array<[string, Array<string>]>
		).map(
			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			([modeUuid, paths]) =>
				[
					modeUuid,
					new ClientMode({
						modeUuid,
						paths
					})
				] as const
		)
	]);

	/**
	 * Relations between modes and canvases.
	 */
	public modesIndex: Map<Uuid, Array<Uuid>> = new Map();

	/**
	 * Stores for pinia.
	 */
	public readonly piniaStores: Stores;

	/**
	 * Client shards.
	 *
	 * Should be treated as "readonly". Use "addShard" and "removeShard" methods instead.
	 * These methods are semantically different from similar of [[ClientShard]], etc., as they are providing respective methods for the [[ClientUniverse]] itself.
	 *
	 * The "getShard", "getGrid", etc., are semantically different from above.
	 */
	public readonly shards: Map<Uuid, ClientShard> = new Map();

	/**
	 * Shards index.
	 */
	public readonly shardsIndex: Map<Uuid, ClientShard> = new Map();

	/**
	 * Vue store.
	 */
	public readonly store: Store<UniverseState>;

	/**
	 * Universe element.
	 */
	public readonly universeElement: HTMLElement;

	/**
	 * Vue.
	 */
	public readonly vue: App;

	/**
	 * Constructor.
	 * The constructor can never be called more than once, during the execution of the program.
	 *
	 * @param superParams - Super parameters
	 * @param param - Destructured parameter
	 */
	public constructor(
		superParams: CoreUniverseRequiredConstructorParameter,
		{
			created,
			element
		}: {
			/**
			 * HTML element.
			 */
			element: HTMLElement;

			/**
			 * Created promise.
			 */
			created: DeferredPromise<void>;
		}
	) {
		// Call superclass
		// TODO: Add universe UUID
		super(superParams);

		this.universeElement = element;

		// Generate base class
		this.Base = ClientBaseFactory({ element, universe: this });

		// Generate object classes
		this.Shard = ClientShardFactory({ Base: this.Base });
		this.Grid = ClientGridClassFactory({ Base: this.Base });
		this.Cell = ClientCellFactory({ Base: this.Base });
		this.Entity = ClientEntityFactory({ Base: this.Base });

		const {
			vue,
			store,
			piniaStores
		}: {
			/**
			 * Stores for pinia.
			 */
			piniaStores: Stores;

			/**
			 * App.
			 */
			vue: App;

			/**
			 * Store.
			 */
			store: Store<UniverseState>;
		} = createVueApp<UniverseState>({
			actions: {
				/**
				 * Called when any entity dictionary changes.
				 *
				 * @param param - Destructured parameter
				 */
				// Infer argument
				// eslint-disable-next-line @typescript-eslint/typedef
				updateEntityDictionary({ state }) {
					// Do nothing
					state.universe.log({ level: LogLevel.Debug, message: "Entity dictionary update dispatched" });
				},

				/**
				 * Called when universe changes.
				 *
				 * @param param - Destructured parameter
				 */
				// Infer argument
				// eslint-disable-next-line @typescript-eslint/typedef
				updateNotifications({ state }) {
					// Do nothing
					state.universe.log({ level: LogLevel.Debug, message: "Notifications store update dispatched" });
				},

				/**
				 * Called when any player dictionary changes.
				 *
				 * @param param - Destructured parameter
				 */
				// Infer argument
				// eslint-disable-next-line @typescript-eslint/typedef
				updatePlayerDictionary({ state }) {
					// Do nothing
					state.universe.log({ level: LogLevel.Debug, message: "Player dictionary update dispatched" });
				},

				/**
				 * Called when universe changes.
				 *
				 * @param param - Destructured parameter
				 */
				// Infer argument
				// eslint-disable-next-line @typescript-eslint/typedef
				updateUniverse({ state }) {
					// Do nothing
					state.universe.log({ level: LogLevel.Debug, message: "Universe store update dispatched" });
				}
			},
			component: UniverseComponent,
			mutations: {
				/**
				 * @param state - State
				 * @param param - Destructured parameter
				 */
				recordMutation(
					state: UniverseState,
					{
						id,
						value
					}: {
						/**
						 * ID.
						 */
						id: string;

						/**
						 * Value.
						 */
						value: any;
					}
				) {
					// Set record, which is defined as `any``
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					state.records[id] = value;
				},

				/**
				 * Updates right-click menu data.
				 *
				 * @remarks
				 * The whole data object will be overwritten each click, so it's safe to watch it.
				 *
				 * @param state - State context
				 * @param data - Data to set to
				 */
				updateRcMenuData(state: UniverseState, data: ClientUniverseStateRcMenuData) {
					state.rcMenuData = data;
				}
			},
			state: { rcMenuData: null, records: { alert: true }, theme: Theme.Dark, universe: this }
		});
		this.vue = vue;
		this.store = store;
		this.piniaStores = piniaStores;

		// Mount vue
		let vueElement: HTMLElement = document.createElement("div");
		this.vue.mount(vueElement);

		// Display vue
		element.after(vueElement);

		// Default shard
		let defaultShardCreated: DeferredPromise = new DeferredPromise();
		let defaultShardAttach: Promise<void> = new Promise((resolve, reject) => {
			defaultShardCreated.then(resolve).catch(reject);
		});
		let defaultShardArg: CoreShardArg<ClientOptions> = {
			grids: new Map(),
			shardUuid: this.getDefaultShardUuid()
		};
		this.defaultShard = this.addShard(
			defaultShardArg,
			{ attachHook: defaultShardAttach, created: defaultShardCreated },
			[]
		);
		defaultShardAttach
			.catch(error => {
				this.log({
					error: new Error(`Failed to attach default shard in universe(universeUuid="${this.universeUuid}").`, {
						cause: error instanceof Error ? error : undefined
					}),
					level: LogLevel.Warning
				});
			})
			.then(async () => {
				// Wait for all images to load
				await Promise.all(Array.from(this.modes.values()).map(mode => mode.isInitialized));
				const fadeTime: number = 5000;
				const bgVolume: number = 0.1;

				// Mute initially
				Howler.mute(true);

				// Sound
				let bgSounds: Array<Howl> = [
					{ endTime: 106000, src: "/sound/lexin-music/cinematic-ambient-piano-118668.mp3", startTime: 0 },
					{ endTime: 131000, src: "/sound/lexin-music/cinematic-documentary-115669.mp3", startTime: 0 },
					{ endTime: 88000, src: "/sound/amaranta-music/light-and-darkness-110414.mp3", startTime: 25000 }
					// False negative
					// eslint-disable-next-line @typescript-eslint/typedef
				].map(({ src, startTime, endTime }, index, array) => {
					let howl: Howl = new Howl({
						/**
						 * Queueing.
						 */
						onplay: (): void => {
							setTimeout(() => {
								// Start fading this
								howl.fade(bgVolume, 0, fadeTime);

								// Get next
								let newIndex: number = index + 1;
								let newHowl: Howl | undefined = bgSounds[newIndex < array.length ? newIndex : 0];

								if (newHowl) {
									// Play and fade next
									newHowl.play("default");
									newHowl.fade(0, bgVolume, fadeTime);
								}
								// Negative delay should be OK
							}, endTime - startTime - fadeTime);
						},
						sprite: {
							// *Should* work fine with negative duration
							default: [startTime, endTime - startTime]
						},
						src,
						volume: bgVolume
					});

					// Return
					return howl;
				});

				bgSounds[0]?.play("default");

				// Cannot play if user did not interact with page; It seems that playing, even if muted, actually begins after context is acquired; To avoid cacophony from simultaneous sounds on first user interaction, advanced audiovisual effects queue should depend on core state readiness, which this function should initialize (Similar effect would be achieved by making sound queue dequeue based on sound lifecycle callbacks, but in that case visual effects would have to be tied to sounds, but it is better for both to be controlled by an independent queue)
				if (Howler.ctx.state === "running") {
					Howler.mute(false);
				} else {
					/**
					 * Plays the sound.
					 */
					// eslint-disable-next-line no-inner-declarations
					let playSound: () => void = () => {
						if (Howler.ctx.state === "running") {
							Howler.mute(false);
							Howler.ctx.removeEventListener("statechange", playSound);
						}
					};

					Howler.ctx.addEventListener("statechange", playSound);
				}

				// JavaScript based events
				element.addEventListener("contextmenu", event => {
					// Stops showing default context menu
					event.preventDefault();

					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// TODO: Calculate and store shard offsets; Terminate iteration on first
						// Send events to the relevant shards
						clientShard.fireInput(rcSymbol, {
							x: event.x,
							y: event.y
						});
					});
				});

				// Scroll does not work on mobile phone
				element.addEventListener("wheel", event => {
					// Prevent zoom in HTML
					event.preventDefault();

					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(scrollSymbol, {
							x: 0,
							y: event.deltaY
						});
					});
				});
				// Keyboard events
				// Prepare mousetrap instance
				let mousetrap: Mousetrap.MousetrapInstance = new Mousetrap();
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("up", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(upSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("w", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(upSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("down", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(downSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("s", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(downSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("right", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(rightSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("d", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(rightSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("left", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(leftSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("a", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(leftSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("o", () => {
					this.shards.forEach(clientShard => {
						clientShard.fireInput(levelUpSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("p", () => {
					this.shards.forEach(clientShard => {
						clientShard.fireInput(levelDownSymbol, {
							x: 0,
							y: 0
						});
					});
				});
				// We don't care about return
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				mousetrap.bind("e", () => {
					this.shards.forEach(clientShard => {
						clientShard.fireInput(localActionSymbol, {
							x: 0,
							y: 0
						});
					});
				});

				// Touch events
				let hammer: HammerManager = new Hammer(element);

				// Tap works both for the browser's mouseclick and the mobile tap
				hammer.on("tap", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(lcSymbol, {
							x: 0,
							y: 0
						});
					});
				});

				// Press works only on mobile phone
				hammer.on("press", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// TODO: Add coordinates from Hammer and move dispatching to separate function together with right-click
						// Send events to the relevant shards
						clientShard.fireInput(rcSymbol, {
							x: 0,
							y: 0
						});
					});
				});

				// Pinch does not work on mouse scroll
				hammer.on("pinch", () => {
					// Iterates through shards conditionally
					this.shards.forEach(clientShard => {
						// Send events to the relevant shards
						clientShard.fireInput(scrollSymbol, {
							x: 0,
							y: 0
						});
					});
				});
			})
			.finally(() => {
				created.resolve();
			});
	}

	/**
	 * Adds shard (Client universe level).
	 *
	 * @remarks
	 * Exists to appropriately verbally implement super.
	 */
	public addShard(
		...shardArgs: [
			...coreParams: CoreUniverseObjectConstructorParameters<
				ClientBaseConstructorParams,
				CoreShardArg<ClientOptions>,
				CoreArgIds.Shard,
				ClientOptions,
				CoreShardArgParentIds
			>,
			clientParams?: {
				/**
				 * Append or not.
				 */
				doAppend: boolean;
			}
		]
	): ClientShard;

	/**
	 * Adds shard (Pass through extra shard parameters).
	 *
	 * If this overload doesn't exist, subclass(just for future-proof if there would be one) doesn't pick up that argument depending on `this` is a tuple, when calling superclass, similarly to calling superclass in {@link CoreUniverse.addShard} implementation.
	 */
	public addShard(...shardArgs: ConstructorParameters<this["Shard"]>): ClientShard;

	// ESLint params bug
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * Adds a shard.
	 *
	 * @remarks
	 * Appends HTML here, since if there is multiple shards, universe might want to control css.
	 *
	 * @param param - Destructured parameter
	 * @override
	 */
	public addShard(
		// ESLint bug - nested args
		// eslint-disable-next-line @typescript-eslint/typedef
		...shardArgs: ConstructorParameters<this["Shard"]>
	): ClientShard {
		// False positive
		// eslint-disable-next-line @typescript-eslint/typedef
		let [, { attachHook }, , clientShardOptions]: ConstructorParameters<this["Shard"]> = shardArgs;
		attachHook
			// Append before other attach hook functionality
			.then(() => {
				if (clientShardOptions?.doAppend) {
					let element: HTMLElement = this.universeElement;

					// Attach shard to universe and update dimensions the css changes
					element.appendChild(clientShard.shardElement);

					// Work with joystick
					if (utils.isMobile.any) {
						const moveDelta: number = 250;
						let joystickElement: HTMLElement = document.createElement("div");
						joystickElement.classList.add("joystick");
						clientShard.shardElement.appendChild(joystickElement);
						let joystickManager: JoystickManager = createJoystick({
							color: "slateblue",
							dynamicPage: true,
							mode: "static",
							position: {
								left: "50%",
								top: "50%"
							},
							threshold: 0.7,
							zone: joystickElement
						});
						let intervalId: ReturnType<typeof setInterval> | undefined;

						// Joystick movements
						joystickManager.on("dir", (event, joystick) => {
							if (intervalId !== undefined) {
								clearInterval(intervalId);
							}

							intervalId = setInterval(() => {
								this.shards.forEach(clientShard => {
									// Up movement
									if (joystick.direction.angle === "up") {
										clientShard.fireInput(upSymbol, {
											x: 0,
											y: 0
										});
									}

									// Down movement
									if (joystick.direction.angle === "down") {
										clientShard.fireInput(downSymbol, {
											x: 0,
											y: 0
										});
									}

									// Right movement
									if (joystick.direction.angle === "right") {
										clientShard.fireInput(rightSymbol, {
											x: 0,
											y: 0
										});
									}

									// Left movement
									if (joystick.direction.angle === "left") {
										clientShard.fireInput(leftSymbol, {
											x: 0,
											y: 0
										});
									}
								});
							}, moveDelta);
						});

						joystickManager.on("end", () => {
							if (intervalId !== undefined) {
								clearInterval(intervalId);
							}
						});
					}
				}
			})
			.catch(error => {
				this.log({
					error: new Error("Could not append element.", { cause: error instanceof Error ? error : undefined }),
					level: LogLevel.Critical
				});
			})
			.finally(() => {
				// Finally notify state
				this.store.dispatch("updateUniverse").catch(error => {
					this.log({
						error: new Error(`Could not dispatch "updateUniverse" to universe store.`, {
							cause: error
						}),
						level: LogLevel.Critical
					});
				});
			});
		let clientShard: ClientShard = super.addShard(...shardArgs);

		return clientShard;
	}

	/**
	 * Remove [[ClientShard]] from [[ClientUniverse]].
	 *
	 * Removes unused modes.
	 *
	 * @param param - Destructured parameter
	 */
	public doRemoveShard({ shardUuid }: ShardPathExtended): void {
		// Checks if there is something to delete in the first place; Then within all the modes associated with the uuid of the shard to delete, we check that they are not within an array made up from all the other mode associations from "modesIndex" to other shards; And if there is no match, then we delete the mode; Finally we delete the shard and the "modesIndex" entry
		if (this.shards.has(shardUuid)) {
			// Tell shard it is about to be deleted
			this.shards.get(shardUuid)?.terminateShard();

			// Clean up the modes
			if (this.modesIndex.has(shardUuid)) {
				// Just checked if defined
				(this.modesIndex.get(shardUuid) as Array<Uuid>).forEach(modeUuid => {
					if (
						!Array.from(this.modesIndex)
							// False negative
							// eslint-disable-next-line @typescript-eslint/typedef
							.filter(function ([key]) {
								return key !== shardUuid;
							})
							// False negative
							// eslint-disable-next-line @typescript-eslint/typedef
							.reduce(function (result, [, modesArray]) {
								return new Set([...Array.from(result), ...modesArray]);
							}, new Set())
							.has(modeUuid)
					) {
						this.modes.delete(modeUuid);
					}
				});

				// Actually remove the shard and modes index
				this.shards.delete(shardUuid);
				this.modesIndex.delete(shardUuid);
			}
		}
	}

	/**
	 * Get [[Mode]].
	 *
	 * A shortcut function.
	 *
	 * @param param - Destructured parameter
	 * @returns Modes for client
	 */
	public getMode({
		uuid
	}: {
		/**
		 * Uuid of the mode.
		 */
		uuid: Uuid;
	}): ClientMode {
		let mode: ClientMode | undefined = this.modes.get(uuid);
		if (mode === undefined) {
			this.log({
				level: LogLevel.Notice,
				message: `Mode(modeUuid="${uuid}") was not found in universe(universeUuid="${this.universeUuid}"), and was substituted with default mode.`
			});

			// Return default mode
			return this.defaultMode;
		}
		return mode;
	}
}
