/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file UUID search functionality
 */

import { CoreCell } from "../comms/cell";
import { CoreEntity } from "../comms/entity";
import { CoreGrid } from "../comms/grid";
import { CoreShard } from "../comms/shard";
import { Uuid } from "./uuid";

/**
 * Requirements to search for SGCEs by UUID.
 */
export interface UuidSearch {
	/**
	 * Indexing for shards.
	 */
	shardsIndex: Map<Uuid, CoreShard>;

	/**
	 * Indexing for grids.
	 */
	gridsIndex: Map<Uuid, CoreGrid>;

	/**
	 * Indexing for cells.
	 */
	cellsIndex: Map<Uuid, CoreCell>;

	/**
	 * Indexing for entities.
	 */
	entitiesIndex: Map<Uuid, CoreEntity>;
}
