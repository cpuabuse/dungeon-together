/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client universe.
 */
import Hammer from "hammerjs";
import type HammerManager from "hammerjs";
import Mousetrap from "mousetrap";
import { BaseTexture, Texture } from "pixi.js";
import { defaultModeUuid, defaultShardUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CellPath } from "../comms/cell";
import { EntityPath } from "../comms/entity";
import { GridPath } from "../comms/grid";
import { CommsShardArgs, ShardPath } from "../comms/shard";
import { CommsUniverse } from "../comms/universe";
import { ClientCell } from "./cell";
import { ClientEntity } from "./entity";
import { ClientGrid } from "./grid";
import { downSymbol, lcSymbol, leftSymbol, rcSymbol, rightSymbol, scrSymbol, upSymbol } from "./input";
import { Mode } from "./mode";
import { ClientProto } from "./proto";
import { ClientShard } from "./shard";

/**
 * All instances in client.
 *
 * Termination of the client is impossible, because it is global.
 * For same reason [[Client]] does not store "defaultInstanceUuid" inside.
 */
export class ClientUniverse implements CommsUniverse {
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
				textures: [new Texture(new BaseTexture("img/rltiles/dc-mon0/0man/human.bmp"))]
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
	 * Constructor.
	 * The constructor can never be called more than once, during the execution of the program.
	 *
	 * @param element - HTML elements
	 */
	public constructor() {
		// Object initialization
		setTimeout(() => {
			this.addShard({ grids: new Map(), shardUuid: defaultShardUuid });
		});

		// Identify DOM
		let universeElement: HTMLElement = ClientProto.prototype.element;

		// JavaScript based events
		universeElement.addEventListener("contextmenu", event => {
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
		universeElement.addEventListener("click", event => {
			// Stops showing default context menu
			event.preventDefault();

			// Iterates through shards conditionally
			this.shards.forEach(clientShard => {
				// Send events to the relevant shards
				clientShard.fireInput(lcSymbol, {
					x: 0,
					y: 0
				});
			});
		});
		// Keyboard events
		// Prepare mousetrap instance
		let mousetrap: Mousetrap.MousetrapInstance = new Mousetrap(universeElement);
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
		let hammer: HammerManager = new Hammer(universeElement);
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
	}

	/**
	 * Add [[ClientShard]] to [[ClientUniverse]].
	 *
	 * Adds the modes from the shard.
	 *
	 * @param shard - Arguments for the [[ClientShard]] constructor
	 */
	public addShard(shard: CommsShardArgs): void {
		if (this.shards.has(shard.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveShard(shard);
		}

		// Set the shard and reset modes index
		let modesIndex: Array<Uuid> = new Array();
		let clientShard: ClientShard = new ClientShard(shard);
		this.shards.set(clientShard.shardUuid, new ClientShard(shard));
		this.modesIndex.set(shard.shardUuid, modesIndex);

		// Populate the universe modes
		clientShard.modes.forEach((mode, uuid) => {
			this.modes.set(uuid, mode);
			modesIndex.push(uuid);
		});
	}

	/**
	 * Remove [[ClientShard]] from [[ClientUniverse]].
	 *
	 * Removes unused modes.
	 */
	public doRemoveShard({ shardUuid }: ShardPath): void {
		// Checks if there is something to delete in the first place; Then within all the modes associated with the uuid of the shard to delete, we check that they are not within an array made up from all the other mode associations from "modesIndex" to other shards; And if there is no match, then we delete the mode; Finally we delete the shard and the "modesIndex" entry
		if (this.shards.has(shardUuid)) {
			// Tell shard it is about to be deleted
			(this.shards.get(shardUuid) as ClientShard).terminate();

			// Clean up the modes
			if (this.modesIndex.has(shardUuid)) {
				// Just checked if defined
				(this.modesIndex.get(shardUuid) as Array<Uuid>).forEach(modeUuid => {
					if (
						!Array.from(this.modesIndex)
							.filter(function ([key]) {
								return key !== shardUuid;
							})
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
	 * Get [[ClientCell]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to cell
	 *
	 * @returns [[ ClientCell]]
	 */
	public getCell(path: CellPath): ClientCell {
		return this.getShard(path).getGrid(path).getCell(path);
	}

	/**
	 * Get [[ClientEntity]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to entity
	 *
	 * @returns [[ClientEntity]], the smallest renderable
	 */
	public getEntity(path: EntityPath): ClientEntity {
		return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
	}

	/**
	 * Get [[ClientGrid]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to grid
	 *
	 * @returns [[ ClientGrid]]
	 */
	public getGrid(path: GridPath): ClientGrid {
		return this.getShard(path).getGrid(path);
	}

	/**
	 * Get [[Mode]].
	 *
	 * A shortcut function.
	 *
	 * @returns Modes for client
	 */
	public getMode({
		uuid
	}: {
		/**
		 *
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

	/**
	 * Get [[ClientShard]].
	 *
	 * A shortcut function.
	 *
	 * @returns [[clientShard]], everything happening on the screen
	 */
	public getShard({ shardUuid }: ShardPath): ClientShard {
		let clientShard: ClientShard | undefined = this.shards.get(shardUuid);

		if (clientShard === undefined) {
			// "defaultShardUuid" is always present, since it is initialized and cannot be removed or overwritten
			return this.shards.get(defaultShardUuid) as ClientShard;
		}
		return clientShard;
	}

	/**
	 * Remove [[ClientShard]] from [[ClientUniverse]].
	 *
	 * Removes unused modes.
	 *
	 * @param path - Path to shard
	 */
	public removeShard(path: ShardPath): void {
		// Never remove "defaultShardUuid"
		if (path.shardUuid === defaultShardUuid) {
			return;
		}
		this.doRemoveShard(path);
	}
}

/**
 * Initialize the [[ClientUniverse]].
 *
 * Timeouts in [[ClientUniverse]] should be executed first.
 *
 * @param element - HTML elements
 *
 */
export async function initUniverse(element: HTMLElement): Promise<void> {
	// Shards
	ClientProto.prototype.element = element;
	ClientProto.prototype.universe = new ClientUniverse();
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve();
		});
	});
}

/**
 * Gets the [[ClientShard]].
 *
 * @param path - Path to shard
 *
 * @returns Shards or default shards
 */
export async function getShard(path: ShardPath): Promise<ClientShard> {
	return ClientProto.prototype.universe.getShard(path);
}
