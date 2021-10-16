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
import { CoreArgsIds, CoreArgsOptionsUnion } from "./args";
import { CommsGrid, CommsGridArgs, CommsGridRaw, CoreGridArgs, GridPath, commsGridRawToArgs } from "./grid";

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
 * Core shard args.
 */
export type CoreShardArgs<O extends CoreArgsOptionsUnion> = (O[CoreArgsIds.Path] extends true
	? ShardPath
	: ShardOwnPath) & {
	/**
	 * Grids.
	 */
	grids: O[CoreArgsIds.Map] extends true ? Map<Uuid, CoreGridArgs<O>> : Array<CoreGridArgs<O>>;
};

/**
 * Typeof class for shards.
 */
export type CoreShardClass = {
	new (...args: any[]): CommsShard;
};

/**
 * Interface as basis for class implementation.
 */
export interface CommsShard extends CommsShardArgs {
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
 * Core shard.
 */
export type CoreShard = CommsShard;

/**
 * Way to get to shard.
 */
export interface ShardOwnPath {
	/**
	 * Shard uuid.
	 */
	shardUuid: Uuid;
}

/**
 * Way to get to shard.
 */
export type ShardPath = ShardOwnPath;

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
