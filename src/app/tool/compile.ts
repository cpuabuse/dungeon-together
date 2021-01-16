/*
Copyright 2020 cpuabuse.com
Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CommsCellArgs, CommsCellRaw } from "../comms/cell";
import { CommsEntityArgs, CommsEntityRaw } from "../comms/entity";
import { CommsGridArgs, CommsGridRaw, commsGridRawToArgs } from "../comms/grid";
import { CommsShardArgs, CommsShardRaw, commsShardRawToArgs } from "../comms/shard";
import {
	array as arrayType,
	intersection as intersectionType,
	partial as partialType,
	string as stringType,
	type,
	TypeOf as typeOf,
	union as unionType
} from "io-ts";
import { getDefaultUuid } from "../common/uuid";
import { safeLoad } from "js-yaml";

/**
 * Settings to be passed to parser.
 */
interface Settings {
	baseUrl: string;
	defaultPath: string;
	userPath: string;
}

/**
 * Default URL path to the uuid generator.
 */
const defaultSystemPath: string = "system";

/**
 * Default URL path to the uuid generator, when users specifies `system` as user path.
 */
const defaultSecondarySystemPath: string = "sys";

/**
 * A separator for URL.
 */
const sep: string = "/";

/**
 * Allowed protocol as returned by URL.
 */
const protocol: string = "https:";

/**
 * Structured object that contains id.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const idLikeType = partialType({ id: stringType });

/**
 * Structured entity object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const entityType = type({ kind: stringType });

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
const gridType = intersectionType([
	type({
		cells: arrayType(cellType)
	}),
	idLikeType
]);

/**
 * Structured shard object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const shardType = intersectionType([
	type({
		grids: arrayType(gridType)
	}),
	idLikeType
]);

/**
 * The ID-like from YAML.
 */
type YamlIdLike = typeOf<typeof idLikeType>;

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
	// eslint-disable-next-line @typescript-eslint/camelcase
	base_url: stringType,
	data: unionType([entityType, cellType, gridType, shardType]),
	type: stringType,
	// eslint-disable-next-line @typescript-eslint/camelcase
	url_path: stringType
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
		// Perform check to make sure the URL is actually a URL
		let baseUrl: string = safeLoadResult.base_url;
		let url: URL = new URL(baseUrl);
		if (encodeURIComponent(baseUrl) !== url.origin) {
			throw new Error('Base URL is not in format "https://cpuabuse.com"');
		}
		if (url.protocol !== protocol) {
			throw new Error('The protocol for base URL is not "https"');
		}

		// Perfomrs check for the user path
		let userPath: string = safeLoadResult.url_path;

		// Settings from root
		let settings: Settings = {
			baseUrl,
			defaultPath: defaultSystemPath === userPath ? defaultSecondarySystemPath : defaultSystemPath,
			userPath
		};

		// Call different functions for different types
		switch (safeLoadResult.type) {
			case "shard":
				// Perform shard data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(settings, safeLoadResult.data);
				}
				throw new Error("Shard did not pass type validation");
			case "grid":
				// Perform grid data check
				if (gridType.is(safeLoadResult.data)) {
					return compileGridArgs(settings, safeLoadResult.data);
				}
				throw new Error("Grid did not pass type validation");
			case "cell":
				// Perform cell data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(settings, safeLoadResult.data);
				}
				throw new Error("Cell did not pass type validation");
			case "entity":
				// Perform entity data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(settings, safeLoadResult.data);
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
 * Extracts path from ID-like.
 */
function idLikeToPath(idLike: YamlIdLike, settings: Settings): string {
	return typeof idLike.id === "undefined" ? settings.defaultPath : settings.userPath + sep + idLike.id;
}

/**
 * Create child settings.
 */
function createChildSettings(index: number, settings: Settings): Settings {
	let childSettings: Settings = { ...settings };
	childSettings.defaultPath += sep + index.toString();
	return childSettings;
}

/**
 * Compiles a shard.
 */
function compileShardArgs(settings: Settings, shard: YamlShard): CommsShardArgs {
	return commsShardRawToArgs(compileShardRaw(settings, shard));
}

/**
 * Compiles a raw shard.
 */
function compileShardRaw(settings: Settings, shard: YamlShard): CommsShardRaw {
	return {
		grids: shard.grids.map(function (grid, index) {
			return compileGridRaw(createChildSettings(index, settings), grid);
		}),
		shardUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(shard, settings)
		})
	};
}

/**
 * Compiles a grid.
 */
function compileGridArgs(settings: Settings, grid: YamlGrid): CommsGridArgs {
	return commsGridRawToArgs(compileGridRaw(settings, grid));
}

/**
 * Compiles a raw grid.
 */
function compileGridRaw(settings: Settings, grid: YamlGrid): CommsGridRaw {
	return {
		cells: grid.cells.map(function (cell, index) {
			return compileCellRaw(createChildSettings(index, settings), cell);
		}),
		gridUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(grid, settings)
		})
	};
}

/**
 * Compiles a raw cell.
 */
function compileCellRaw(settings: Settings, cell: YamlCell): CommsCellRaw {
	return {
		cellUuid: "abc",
		entities: cell.entities.map(function (entity) {
			return compileEntityRaw(settings, entity);
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
function compileEntityRaw(settings: Settings, entity: YamlEntity): CommsEntityRaw {
	return {
		entityUuid: "abc",
		kindUuid: getDefaultUuid({ base: settings.baseUrl, path: entity.kind }),
		modeUuid: "abc",
		worldUuid: "abc"
	};
}
