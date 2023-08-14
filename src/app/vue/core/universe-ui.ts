/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";

/**
 * Universe UI related types.
 *
 * @file
 */

/**
 * Model type for universe ui shard component.
 */
export type UniverseUiShardModel = {
	/**
	 * Player list.
	 */
	players: Array<ClientPlayer>;
};

/**
 * Shard entries data type, to restore lost unref class type information.
 */
export type UniverseUiShardEntries = Array<
	[
		Uuid,
		{
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
		}
	]
>;
