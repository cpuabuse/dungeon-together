/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { ClientPlayer } from "../../client/connection";

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
