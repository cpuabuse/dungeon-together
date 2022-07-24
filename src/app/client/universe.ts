/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client universe
 */

import vueHljs from "@highlightjs/vue-plugin";
import Hammer from "hammerjs";
import type HammerManager from "hammerjs";
import Mousetrap from "mousetrap";
import { BaseTexture, Texture } from "pixi.js";
import { App, createApp } from "vue";
import { createStore } from "vuex";
import { DeferredPromise } from "../common/async";
import { defaultModeUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreShardArg, ShardPathExtended } from "../core/shard";
import { CoreUniverseClassFactory, CoreUniverseRequiredConstructorParameter } from "../core/universe";
import UniverseComponent from "../vue/universe.vue";
import { ClientBaseClass, ClientBaseConstructorParams, ClientBaseFactory } from "./base";
import { ClientCell, ClientCellClass, ClientCellFactory } from "./cell";
import { ClientEntity, ClientEntityClass, ClientEntityFactory } from "./entity";
import { ClientGrid, ClientGridClass, ClientGridClassFactory } from "./grid";
import { UniverseState } from "./gui";
import { Theme } from "./gui/themes";
import { downSymbol, lcSymbol, leftSymbol, rcSymbol, rightSymbol, scrollSymbol, upSymbol } from "./input";
import { Mode } from "./mode";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard, ClientShardClass, ClientShardFactory } from "./shard";

// Static init
import "./gui/static-init";

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
>({ options: clientOptions }) {
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
		[
			defaultModeUuid,
			{
				textures: [
					new Texture(new BaseTexture("img/bunny-red.svg")),
					new Texture(new BaseTexture("img/bunny-green.svg")),
					new Texture(new BaseTexture("img/bunny-blue.svg"))
				]
			}
		],
		[
			"treasure",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/chest_full_open_anim_f0.png"))]
			}
		],
		[
			"trap",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f0.png"))]
			}
		],
		[
			"door",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/doors_leaf_closed.png"))]
			}
		],
		[
			"floor",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_1.png"))]
			}
		],
		[
			"wall",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/dc-dngn/wall/brick_brown2.bmp"))]
			}
		],
		[
			"enemy",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/dc-mon64/balrug.bmp"))]
			}
		],
		[
			"player",
			{
				textures: [new Texture(new BaseTexture("img/rltiles/player/base/human_m.bmp"))]
			}
		],
		[
			"ladder",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_ladder.png"))]
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

		// Generate base class
		this.Base = ClientBaseFactory({ element, universe: this });

		// Generate object classes
		this.Shard = ClientShardFactory({ Base: this.Base });
		this.Grid = ClientGridClassFactory({ Base: this.Base });
		this.Cell = ClientCellFactory({ Base: this.Base });
		this.Entity = ClientEntityFactory({ Base: this.Base });

		// Create vue
		this.vue = createApp(UniverseComponent);

		// Init vue after initialization
		this.vue.use(createStore<UniverseState>({ state: { theme: Theme.Dark, universe: this } }));
		this.vue.use(vueHljs);

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
			.catch(() => {
				// TODO: Process error
			})
			.finally(() => {
				created.resolve();
			});

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
		let mousetrap: Mousetrap.MousetrapInstance = new Mousetrap(element);
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
			// Default mode is always there
			return this.modes.get(defaultModeUuid) as Mode;
		}
		return mode;
	}
}
