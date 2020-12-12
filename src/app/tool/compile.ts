/*
Copyright 2020 cpuabuse.com
Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CommsCellArgs, CommsCellRaw } from "../comms/cell";
import { CommsEntityArgs, CommsEntityRaw } from "../comms/entity";
import { CommsGridArgs, CommsGridRaw } from "../comms/grid";
import { CommsShardArgs, CommsShardRaw, commsShardRawToArgs } from "../comms/shard";
import { array as arrayType, string as stringType, type, TypeOf as typeOf, union as unionType } from "io-ts";
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

/**
 * The shard from YAML.
 */
type YamlShard = typeOf<typeof shardType>;

/**
 * The grid from YAML.
 */
type YamlGrid = typeOf<typeof gridType>;

/**
 * The cell from YAML.
 */
type YamlCell = typeOf<typeof cellType>;

/**
 * The entity from YAML.
 */
type YamlEntity = typeOf<typeof entityType>;

/**
 * Structured root object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const rootType = type({
	data: unionType([entityType, cellType, gridType, shardType]),
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
		throw new Error("YAML was malformed");
	}
}

/**
 * Compiles a shard.
 */
function compileShardArgs(shard: YamlShard): CommsShardArgs {
	return commsShardRawToArgs(compileShardRaw(shard));
}

/**
 * Compiles a raw shard.
 */
function compileShardRaw(shard: YamlShard): CommsShardRaw {
	return {
		grids: shard.grids.map(function (grid) {
			return compileGridRaw(grid);
		}),
		shardUuid: "abc"
	};
}

/**
 * Compiles a raw grid.
 */
function compileGridRaw(grid: YamlGrid): CommsGridRaw {
	return {
		cells: grid.cells.map(function (cell) {
			return compileCellRaw(cell);
		}),
		gridUuid: "abc"
	};
}

/**
 * Compiles a raw cell.
 */
function compileCellRaw(cell: YamlCell): CommsCellRaw {
	return {
		cellUuid: "abc",
		entities: cell.entities.map(function (entity) {
			return compileEntityRaw(entity);
		}),
		worlds: new Array(),
		x: 0,
		y: 0,
		z: 0
	};
}

/**
 * Compiles a raw entity.
 */
function compileEntityRaw(entity: YamlEntity): CommsEntityRaw {
	return {
		entityUuid: "abc",
		kindUuid: "abc",
		modeUuid: "abc",
		worldUuid: "abc"
	};
}
