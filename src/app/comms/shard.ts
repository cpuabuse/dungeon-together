/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shard.
 */

import { CommsGrid, CommsGridArgs, CommsGridRaw, GridPath } from "./grid";
import { CommsProto } from "./proto";
import { Uuid } from "../common/uuid";

/**
 * Everything-like.
 */
export interface CommsShardArgs extends ShardPath {
	/**
	 * Locations.
	 */
	grids: Map<Uuid, CommsGridArgs>;
}

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsShardRaw = Omit<CommsShardArgs, "grids"> & {
	grids: Array<CommsGridRaw>;
};

/**
 * Interface as basis for class implementation.
 */
export interface CommsShard extends CommsShardArgs, CommsProto {
	/**
	 * Default [[Grid]] UUID.
	 */
	defaultGridUuid: Uuid;

	/**
	 * Adds [[CommsGrid]].
	 */
	addGrid(grid: CommsGridArgs): void;

	/**
	 * Gets [[CommsGrid]].
	 */
	getGrid(path: GridPath): CommsGrid;

	/**
	 * Removes [[CommsGrid]].
	 */
	removeGrid(path: GridPath): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Way to get to shard.
 */
export interface ShardPath {
	/**
	 * Shard uuid.
	 */
	shardUuid: Uuid;
}

/**
 * Converts [[CommsShardRaw]] to [[CommsShardArgs]].
 */
export function commsShardRawToArgs(rawSource: CommsShardRaw): CommsShardArgs {
	return { grids: new Map(), shardUuid: rawSource.shardUuid };
}

/**
 * Converts [[CommsShardArgs]] to [[CommsShardRaw]].
 */
export function commsShardArgsToRaw(argsSource: CommsShardArgs): CommsShardRaw {
	return { grids: new Array(), shardUuid: argsSource.shardUuid };
}
