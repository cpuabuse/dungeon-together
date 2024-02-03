/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Universe UI related types.
 */

import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";
import { CoreDictionary } from "../../core/connection";
import { CompactToolbarMenuConsumerEntry } from "./compact-toolbar";

/**
 * Model type for universe UI player component.
 */
export type UniverseUiPlayerModel = {
	/**
	 * Reactive player dictionary.
	 */
	dictionary: CoreDictionary;
};

/**
 * Player entry.
 */
export type UniverseUiPlayerEntry = {
	/**
	 * Raw player entry.
	 */
	player: ClientPlayer;

	/**
	 * Player model.
	 *
	 * @remarks
	 * Single model for perhaps multiple values is used, as it is already an iteration, and individual variables would only add complexity.
	 */
	model: UniverseUiPlayerModel;
};

/**
 * Player entries data type, to cast and restore lost unref class type information.
 */
export type PlayerEntries = Array<[Uuid, UniverseUiPlayerEntry]>;

/**
 * Model type for universe UI shard component.
 */
export type UniverseUiShardModel = {
	/**
	 * Player list.
	 */
	playerEntries: PlayerEntries;
};

/**
 * Shard entry.
 */
export type UniverseUiShardEntry = {
	/**
	 * Shard.
	 */
	shard: ClientShard;

	/**
	 * Model.
	 *
	 * @remarks
	 * Single model for perhaps multiple values is used, as it is already an iteration, and individual variables would only add complexity.
	 */
	model: UniverseUiShardModel;

	/**
	 * Menu.
	 */
	menuEntry: CompactToolbarMenuConsumerEntry;
};

/**
 * Shard entries data type, to cast and restore lost unref class type information.
 *
 * @remarks
 * To minimize cycles, this object should be passed between linked components directly, and each component that consumes it, would remap this.
 */
export type UniverseUiShardEntries = Map<Uuid, UniverseUiShardEntry>;
