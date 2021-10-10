/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file A tool that compiles YAML to JSON
 */

import {
	array as arrayType,
	intersection as intersectionType,
	number as numberType,
	partial as partialType,
	string as stringType,
	type,
	TypeOf as typeOf,
	union as unionType
} from "io-ts";
import jsyaml from "js-yaml";
import { getDefaultUuid } from "../common/uuid";
import { CommsCellArgs, CommsCellRaw } from "../core/cell";
import { CommsEntityArgs, CommsEntityRaw } from "../core/entity";
import { CommsGridArgs, CommsGridRaw } from "../core/grid";
import { CommsShardArgs, CommsShardRaw, commsShardRawToArgs } from "../core/shard";

/**
 * Settings to be passed to parser.
 */
interface Settings {
	/**
	 *
	 */
	baseUrl: string;
	/**
	 *
	 */
	defaultPath: string;
	/**
	 *
	 */
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
const entityType = intersectionType([
	partialType({
		kind: stringType,
		mode: stringType,
		world: stringType
	}),
	idLikeType
]);

/**
 * Structured cell object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const cellType = intersectionType([
	partialType({
		entities: arrayType(entityType)
	}),
	type({
		x: numberType,
		y: numberType,
		z: numberType
	}),
	idLikeType
]);

/**
 * Structured grid object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const gridType = intersectionType([
	partialType({
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
	partialType({
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
 *
 * @param filename - Path to the file.
 * @param data - YAML string
 * @returns Shard, grid, cell, or entity in args format
 */
export function compile(data: string): CommsShardArgs | CommsGridArgs | CommsCellArgs | CommsEntityArgs {
	// Load YAML
	// eslint-disable-next-line @typescript-eslint/ban-types
	let safeLoadResult: string | object | undefined = jsyaml.safeLoad(data);

	// Perform root type check
	if (rootType.is(safeLoadResult)) {
		// Perform check to make sure the URL is actually a URL
		let baseUrl: string = safeLoadResult.base_url;
		let url: URL = new URL(baseUrl);
		if (url.href !== `${url.origin}/`) {
			throw new Error('Base URL is not in format "https://cpuabuse.com" or "https://cpuabuse.com/"');
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
					return compileShardArgs(safeLoadResult.data, settings);
				}
				throw new Error("Shard did not pass type validation");
			case "grid":
				// Perform grid data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data, settings);
				}
				throw new Error("Grid did not pass type validation");
			case "cell":
				// Perform cell data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data, settings);
				}
				throw new Error("Cell did not pass type validation");
			case "entity":
				// Perform entity data check
				if (shardType.is(safeLoadResult.data)) {
					return compileShardArgs(safeLoadResult.data, settings);
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
 *
 * @param idLike - ID like from YAML
 * @param settings - Settings to be passed to parser
 * @returns Path
 */
function idLikeToPath(idLike: YamlIdLike, settings: Settings): string {
	return typeof idLike.id === "undefined" ? settings.defaultPath : settings.userPath + sep + idLike.id;
}

/**
 * Create child settings.
 *
 * @param index - Index within the array
 * @param settings - Settings
 * @returns Child settings
 */
function createChildSettings(index: number, settings: Settings): Settings {
	let childSettings: Settings = { ...settings };
	childSettings.defaultPath += sep + index.toString();
	return childSettings;
}

/**
 * Compiles a shard.
 *
 * @param shard - Shard
 * @param settings - Settings
 * @returns Shard args
 */
function compileShardArgs(shard: YamlShard, settings: Settings): CommsShardArgs {
	return commsShardRawToArgs(compileShardRaw(shard, settings));
}

/**
 * Compiles a raw shard.
 *
 * @param shard - Shard
 * @param settings - Settings
 * @returns An object with grids and shardUuid
 */
function compileShardRaw(shard: YamlShard, settings: Settings): CommsShardRaw {
	return {
		grids:
			typeof shard.grids === "undefined"
				? []
				: shard.grids.map(function (grid, index) {
						return compileGridRaw(grid, createChildSettings(index, settings));
				  }),
		shardUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(shard, settings)
		})
	};
}

/**
 * Compiles a raw grid.
 *
 * @param grid - Grid
 * @param settings - Settings
 * @returns An object with cells and gridUuid
 */
function compileGridRaw(grid: YamlGrid, settings: Settings): CommsGridRaw {
	return {
		cells:
			typeof grid.cells === "undefined"
				? []
				: grid.cells.map(function (cell, index) {
						return compileCellRaw(cell, createChildSettings(index, settings));
				  }),
		gridUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(grid, settings)
		})
	};
}

/**
 * Compiles a raw cell.
 *
 * @param cell - Cell
 * @param settings - Settings
 * @returns An object with cellUuid, entities, and worlds as key values
 */
function compileCellRaw(cell: YamlCell, settings: Settings): CommsCellRaw {
	return {
		cellUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(cell, settings)
		}),
		entities:
			typeof cell.entities === "undefined"
				? []
				: cell.entities.map(function (entity, index) {
						return compileEntityRaw(entity, createChildSettings(index, settings));
				  }),
		worlds: [],
		x: cell.x,
		y: cell.y,
		z: cell.z
	};
}

/**
 * Compiles a raw entity.
 *
 * @param entity - Entity
 * @param settings - Settings
 * @returns An object wiht entityUuid, kindUuid, modeUuid, and worldUuid
 */
function compileEntityRaw(entity: YamlEntity, settings: Settings): CommsEntityRaw {
	return {
		entityUuid: getDefaultUuid({
			base: settings.baseUrl,
			path: idLikeToPath(entity, settings)
		}),
		kindUuid: getDefaultUuid({ base: settings.baseUrl, path: "id-to-generate-the-kind" }),
		modeUuid:
			typeof entity.kind === "undefined"
				? getDefaultUuid({ base: settings.baseUrl, path: "id-to-generate-the-mode" })
				: entity.kind,
		worldUuid: getDefaultUuid({ base: settings.baseUrl, path: "id-to-generate-the-world" })
	};
}
