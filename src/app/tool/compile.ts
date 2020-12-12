/*
Copyright 2020 cpuabuse.com
Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CommsShardArgs, CommsShardRaw, commsShardRawToArgs } from "../comms/shard";
import { array as arrayType, string as stringType, type, TypeOf as typeOf, unknown as unknownType } from "io-ts";
import { CommsCellArgs } from "../comms/cell";
import { CommsEntityArgs } from "../comms/entity";
import { CommsGridArgs } from "../comms/grid";
import { safeLoad } from "js-yaml";

/**
 * Structured entity object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const entityType = type({});

/**
 * Structured cell object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const cellType = type({
	entities: arrayType(entityType)
});

/**
 * Structured grid object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const gridType = type({
	cells: arrayType(cellType)
});

/**
 * Structured shard object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const shardType = type({
	grids: arrayType(gridType)
});

type Shard = typeOf<typeof shardType>;

/**
 * Structured root object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const rootType = type({
	data: unknownType,
	type: stringType
});

/**
 * A function that will compile dt.yml file to JavaScript objects/JSON files.
 * @param filename Path to the file.
 */
export function compile(data: string): CommsShardArgs | CommsGridArgs | CommsCellArgs | CommsEntityArgs {
	// Load YAML
	let safeLoadResult: string | object | undefined = safeLoad(data);

	// Perform root type check
	if (rootType.is(safeLoadResult)) {
		switch (safeLoadResult.type) {
			case "shard":
				// Perform shard data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data);
				}
				throw new Error("Shard did not pass type validation");
			case "grid":
				// Perform grid data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data);
				}
				throw new Error("Grid did not pass type validation");
			case "cell":
				// Perform cell data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data);
				}
				throw new Error("Cell did not pass type validation");
			case "entity":
				// Perform entity data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data);
				}
				throw new Error("Entity did not pass type validation");
			default:
				throw new Error("Type was not specified correctly");
		}
	} else {
		throw new Error("YAML was not an object or did not contain type property");
	}
}

/**
 * Compiles a shard.
 */
function compileShardArgs(shard: Shard): CommsShardArgs {
	return commsShardRawToArgs(compileShardRaw(shard));
}

/**
 * Compiles a raw shard.
 */
function compileShardRaw(shard: Shard): CommsShardRaw {
	return {
		grids: shard.grids.map(function (grid) {
			return { cells: [], gridUuid: "abc" };
		}),
		shardUuid: "abc"
	};
}
