/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Comms shard definition
 */

/**
 * Shard.
 */

import { Uuid } from "../common/uuid";
import { CommsGrid, CommsGridArgs, CommsGridRaw, GridPath, commsGridRawToArgs } from "./grid";
import { CommsProto } from "./proto";

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
	/**
	 *
	 */
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
 *
 * @param rawSource
 */
export function commsShardRawToArgs(rawSource: CommsShardRaw): CommsShardArgs {
	return {
		grids: new Map(
			rawSource.grids.map(function (grid) {
				return [grid.gridUuid, commsGridRawToArgs(grid, rawSource.shardUuid)];
			})
		),
		shardUuid: rawSource.shardUuid
	};
}

/**
 * Converts [[CommsShardArgs]] to [[CommsShardRaw]].
 *
 * @param argsSource
 */
export function commsShardArgsToRaw(argsSource: CommsShardArgs): CommsShardRaw {
	return { grids: new Array(), shardUuid: argsSource.shardUuid };
}
