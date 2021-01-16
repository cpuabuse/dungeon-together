/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Client universe.
 */

import { BaseTexture, Texture } from "pixi.js";
import { CommsShardArgs, ShardPath } from "../comms/shard";
import { defaultModeUuid, defaultShardUuid } from "../common/defaults";
import { CellPath } from "../comms/cell";
import { ClientCell } from "./cell";
import { ClientEntity } from "./entity";
import { ClientGrid } from "./grid";
import { ClientProto } from "./proto";
import { ClientShard } from "./shard";
import { CommsUniverse } from "../comms/universe";
import { EntityPath } from "../comms/entity";
import { GridPath } from "../comms/grid";
import { Mode } from "./mode";
import { Uuid } from "../common/uuid";

/**
 * All instances in client.
 *
 * Termination of the client is impossible, because it is global.
 * For same reason [[Client]] does not store "defaultInstanceUuid" inside.
 */
export class ClientUniverse implements CommsUniverse {
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
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_full_open_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_full_open_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_full_open_anim_f2.png"))
				]
			}
		],
		[
			"goblinIdle",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/goblin_idle_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/goblin_idle_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/goblin_idle_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/goblin_idle_anim_f3.png"))
				]
			}
		],
		[
			"spikeTrap",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/floor_spikes_anim_f3.png"))
				]
			}
		],
		[
			"door",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_all.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_frame_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_frame_righ.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_frame_top.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_leaf_closed.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/doors_leaf_open.png"))
				]
			}
		],
		[
			"floor",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_1.png"))]
			}
		],
		[
			"heart",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/ui_heart_full.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/ui_heart_half.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/ui_heart_empty.png"))
				]
			}
		],
		[
			"wall",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_bottom_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_bottom_right.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_front_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_front_right.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_right.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_top_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_corner_top_right.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_left.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_mid.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/wall_right.png"))
				]
			}
		],
		[
			"treasureKnife",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/weapon_knife.png"))]
			}
		],
		[
			"treasureRustySword",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/weapon_rusty_sword.png"))]
			}
		],
		[
			"holeTrap",
			{
				textures: [new Texture(new BaseTexture("img/dungeontileset-ii/hole.png"))]
			}
		],
		[
			"lizardIdle",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_hit_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_idle_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_idle_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_idle_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_idle_anim_f3.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_run_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_run_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_run_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/lizard_f_run_anim_f3.png"))
				]
			}
		],
		[
			"orcIdle",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_idle_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_idle_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_idle_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_idle_anim_f3.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_run_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_run_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_run_anim_f2.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/masked_orc_run_anim_f3.png"))
				]
			}
		],
		[
			"chestMimic",
			{
				textures: [
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_mimic_open_anim_f0.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_mimic_open_anim_f1.png")),
					new Texture(new BaseTexture("img/dungeontileset-ii/chest_mimic_open_anim_f2.png"))
				]
			}
		]
	]);

	/**
	 * Relations between modes and canvases.
	 */
	public modesIndex: Map<Uuid, Array<Uuid>> = new Map();

	/**
	 * Constructor.
	 */
	public constructor() {
		setTimeout(() => {
			this.addShard({ grids: new Map(), shardUuid: defaultShardUuid });
		});
	}

	/**
	 * Add [[ClientShard]] to [[ClientUniverse]].
	 *
	 * Adds the modes from the shard.
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
	 * Get [[ClientShard]].
	 *
	 * A shortcut function.
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
	 * Get [[Mode]].
	 *
	 * A shortcut function.
	 */
	public getMode({ uuid }: { uuid: Uuid }): Mode {
		let mode: Mode | undefined = this.modes.get(uuid);
		if (mode === undefined) {
			// Default mode is always there
			return this.modes.get(defaultModeUuid) as Mode;
		}
		return mode;
	}

	/**
	 * Get [[ClientCell]].
	 *
	 * A shortcut function.
	 */
	public getCell(path: CellPath): ClientCell {
		return this.getShard(path).getGrid(path).getCell(path);
	}

	/**
	 * Get [[ClientGrid]].
	 *
	 * A shortcut function.
	 */
	public getGrid(path: GridPath): ClientGrid {
		return this.getShard(path).getGrid(path);
	}

	/**
	 * Get [[ClientEntity]].
	 *
	 * A shortcut function.
	 */
	public getEntity(path: EntityPath): ClientEntity {
		return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
	}

	/**
	 * Remove [[ClientShard]] from [[ClientUniverse]].
	 *
	 * Removes unused modes.
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
 */
export async function initUniverse(): Promise<void> {
	// Shards
	(ClientProto.prototype.universe as ClientUniverse) = new ClientUniverse();
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve();
		});
	});
}

/**
 * Gets the [[ClientShard]].
 *
 * @returns Shards or default shards
 */
export async function getShard(path: ShardPath): Promise<ClientShard> {
	return ClientProto.prototype.universe.getShard(path);
}
