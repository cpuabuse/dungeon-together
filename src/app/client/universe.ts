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
import { encode as base64Encode } from "js-base64";
import Mousetrap from "mousetrap";
import { JoystickManager, create as createJoystick } from "nipplejs";
import { BaseTexture, SVGResource, Texture, utils } from "pixi.js";
import { App } from "vue";
import { DeferredPromise } from "../common/async";
import { defaultModeUuid } from "../common/defaults";
import { bunnySvgs } from "../common/images";
import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { LogLevel } from "../core/error";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, ShardPathExtended } from "../core/shard";
import { CoreUniverseClassFactory, CoreUniverseRequiredConstructorParameter } from "../core/universe";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import UniverseComponent from "../vue/universe.vue";
import { ClientBaseClass, ClientBaseConstructorParams, ClientBaseFactory } from "./base";
import { ClientCell, ClientCellClass, ClientCellFactory } from "./cell";
import { ClientEntity, ClientEntityClass, ClientEntityFactory } from "./entity";
import { ClientGrid, ClientGridClass, ClientGridClassFactory } from "./grid";
import { UniverseState, createVueApp } from "./gui";
import { Theme } from "./gui/themes";
import { downSymbol, lcSymbol, leftSymbol, rcSymbol, rightSymbol, scrollSymbol, upSymbol } from "./input";
import { Mode } from "./mode";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard, ClientShardClass, ClientShardFactory } from "./shard";

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

	public readonly defaultMode: Mode = {
		textures: Object.values(bunnySvgs).map(
			/*
				Even though the source code can load XML element, `SVGResource` documentation (https://github.com/pixijs/pixijs/blob/fdbdc45b6a95bd47145e3a7267fe2a69a1be4ebb/packages/core/src/textures/resources/SVGResource.ts#L90-L98) states that it accepts Base64 encoded SVG. Which apparently means Base64 data URI, which we will use to adhere to documentation.
			*/
			bunny => new Texture(new BaseTexture(new SVGResource(`data:image/svg+xml;base64,${base64Encode(bunny)}`)))
		)
	};

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
	public modes: Map<Uuid, Mode> = new Map([
		[defaultModeUuid, this.defaultMode],
		[
			"mode/user/treasure/default",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/chest_full_open_anim_f0.png"))]
			}
		],
		[
			"mode/user/trap/default",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f0.png"))]
			}
		],
		[
			"mode/user/door/default",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/doors_leaf_closed.png"))]
			}
		],
		[
			"mode/user/floor/default",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_1.png"))]
			}
		],
		[
			"mode/user/wall/default",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/dc-dngn/wall/brick_brown2.png"))]
			}
		],
		[
			"mode/user/enemy/default",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/dc-mon64/balrug.png"))]
			}
		],
		[
			"mode/user/player/default",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/player/base/human_m.png"))]
			}
		],
		[
			"mode/user/ladder/default",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_ladder.png"))]
			}
		],
		[
			"death",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/nh-mon1/w/wraith.png"))]
			}
		]
	]);

	/**
	 * Relations between modes and canvases.
	 */
	public modesIndex: Map<Uuid, Array<Uuid>> = new Map();

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

		this.vue = createVueApp<UniverseState>({
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
				}
			},
			state: { records: { alert: true }, theme: Theme.Dark, universe: this }
		});

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
			.then(() => {
				const fadeTime: number = 5000;
				const bgVolume: number = 0.1;

				// Mute initially
				Howler.mute(true);

				// Sound
				let bgSounds: Array<Howl> = [
					{ endTime: 106000, src: "sound/lexin-music/cinematic-ambient-piano-118668.mp3", startTime: 0 },
					{ endTime: 131000, src: "sound/lexin-music/cinematic-documentary-115669.mp3", startTime: 0 },
					{ endTime: 88000, src: "sound/amaranta-music/light-and-darkness-110414.mp3", startTime: 25000 }
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
								let newHowl: Howl = bgSounds[newIndex < array.length ? newIndex : 0];

								// Play and fade next
								newHowl.play("default");
								newHowl.fade(0, bgVolume, fadeTime);
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

				bgSounds[0].play("default");

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
						// Send events to the relevant shards
						clientShard.fireInput(rcSymbol, {
							x: 0,
							y: 0
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
	}): Mode {
		let mode: Mode | undefined = this.modes.get(uuid);
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
