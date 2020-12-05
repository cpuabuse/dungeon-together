/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CommsCellArgs } from "../app/comms/cell";
import { CommsEntityArgs } from "../app/comms/entity";
import { CommsGridArgs } from "../app/comms/grid";
import { CommsShardArgs } from "../app/comms/shard";
import { getDefaultUuid } from "../app/common/uuid";
import { safeLoad } from "js-yaml";

/**
 * Structured root object.
 * Type is used because data was received from internet/file.
 */
type Root = {
	type: string;
	data: object;
};

/**
 * A function that will compile dt.yml file to JavaScript objects/JSON files.
 * @param filename Path to the file.
 */
export async function compile(data: string): Promise<CommsShardArgs | CommsGridArgs | CommsCellArgs | CommsEntityArgs> {
	// Load YAML
	let safeLoadResult: string | object | undefined = safeLoad(data);

	// Create JSON object from YAML
	if (typeof safeLoadResult !== "object") {
		throw new Error("YAML was not an object");
	}
	let yamlObject: object = safeLoadResult;

	// Check if the root of YAML is properly structured

	// Return
	let shard: CommsShardArgs = {
		grids: new Map(),
		shardUuid: getDefaultUuid({
			path: yamlObject.data
		})
	};
	return shard;
}
