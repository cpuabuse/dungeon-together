/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Compiles yaml to arg.
 *
 * @file
 */

import { type } from "io-ts";
import { load } from "js-yaml";
import { YamlShardArg, yamlShardArgType } from "./arg";

/**
 * Structured root object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const rootType = type({ data: yamlShardArgType });

/**
 * Compiles binary string to arg.
 *
 * @param param - Destructured parameter
 * @returns Arg id and arg
 */
export function compile({
	data
}: {
	/**
	 * String data.
	 */
	data: string;
}): YamlShardArg {
	// Load YAML
	// eslint-disable-next-line @typescript-eslint/ban-types
	let loadResult: unknown = load(data);

	if (rootType.is(loadResult)) {
		return loadResult.data;
	}

	// TODO: Process error
	throw new Error("YAML was malformed");
}
