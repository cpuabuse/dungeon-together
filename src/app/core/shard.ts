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

import { defaultShardUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreArgsIds, CoreArgsIdsToOptions, CoreArgsOptions, CoreArgsOptionsUnion } from "./args";
import {
	CommsGrid,
	CommsGridArgs,
	CommsGridRaw,
	CoreGridArgs,
	GridPath,
	commsGridRawToArgs,
	coreGridArgsConvert
} from "./grid";

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
export type CoreShardArgs<O extends CoreArgsOptionsUnion = CoreArgsOptions> = (O[CoreArgsIds.Path] extends true
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

/**
 * Convert shard args between options.
 *
 * Has to strictly follow {@link CoreShardArgs}.
 *
 * @returns Converted shard args
 */
export function coreShardArgsConvert<S extends CoreArgsOptionsUnion, T extends CoreArgsOptionsUnion>({
	shard,
	sourceOptions,
	targetOptions
}: {
	/**
	 * Core shard args.
	 */
	shard: CoreShardArgs<S>;

	/**
	 * Option for the source.
	 */
	sourceOptions: S;

	/**
	 * Option for the target.
	 */
	targetOptions: T;
}): CoreShardArgs<T> {
	// Define source and result, with minimal options
	const sourceShard: CoreShardArgs<S> = shard;
	const sourceShardAs: Record<string, any> = sourceShard;
	// Cannot assign to conditional type without casting
	let targetShard: CoreShardArgs<T> = {
		shardUuid: sourceShard.shardUuid
	} as CoreShardArgs<T>;
	let targetShardAs: Record<string, any> = targetShard;

	/**
	 * Core shard args options with map.
	 */
	type CoreShardArgsOptionsWithMap = CoreArgsIdsToOptions<CoreArgsIds.Map>;

	/**
	 * Core shard args options without map.
	 */
	type CoreShardArgsOptionsWithoutMap = CoreArgsOptions;

	/**
	 * Core shard args with map.
	 */
	type CoreShardArgsWithMap = CoreShardArgs<CoreShardArgsOptionsWithMap>;

	/**
	 * Core shard args without map.
	 */
	type CoreShardArgsWithoutMap = CoreShardArgs<CoreShardArgsOptionsWithoutMap>;

	// Map
	if (targetOptions[CoreArgsIds.Map] === true) {
		let targetShardWithMap: CoreShardArgsWithMap = targetShardAs as CoreShardArgsWithMap;

		if (sourceOptions[CoreArgsIds.Map] === true) {
			// Map to map
			// Cells
			targetShardWithMap.grids = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from((sourceShardAs as CoreShardArgsWithMap).grids, ([uuid, grid]) => [
					uuid,
					coreGridArgsConvert({
						grid,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreShardArgsOptionsWithMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreShardArgsOptionsWithMap
					})
				])
			);
		} else {
			// Array to map
			// Grids
			targetShardWithMap.grids = new Map(
				(sourceShardAs as CoreShardArgsWithoutMap).grids.map(grid => [
					grid.gridUuid,
					coreGridArgsConvert({
						grid,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreShardArgsOptionsWithoutMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreShardArgsOptionsWithMap
					})
				])
			);
		}
	} else {
		let targetShardWithoutMap: CoreShardArgsWithoutMap = targetShardAs as CoreShardArgsWithoutMap;

		if (sourceOptions[CoreArgsIds.Map] === true) {
			// Map to array
			// Grids
			targetShardWithoutMap.grids = Array.from(
				(sourceShardAs as CoreShardArgsWithMap).grids,
				// Argument types correctly inferred from "Array.from()", and UUID is unused, probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
				([uuid, grid]) =>
					// Set to actual type
					coreGridArgsConvert({
						grid,
						sourceOptions: sourceOptions as CoreShardArgsOptionsWithMap,
						targetOptions: targetOptions as CoreShardArgsOptionsWithoutMap
					})
			);
		} else {
			// Array to array
			// Cells
			targetShardWithoutMap.grids = (sourceShardAs as CoreShardArgsWithoutMap).grids.map(grid =>
				// Set to actual type
				coreGridArgsConvert({
					grid,
					sourceOptions: sourceOptions as CoreShardArgsOptionsWithoutMap,
					targetOptions: targetOptions as CoreShardArgsOptionsWithoutMap
				})
			);
		}
	}
	// Return
	return targetShard;
}
