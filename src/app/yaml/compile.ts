/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Compiles yaml to arg.
 *
 * @file
 */

import { TypeOf, array as arrayType, record as recordType, string as stringType, type } from "io-ts";
import { load } from "js-yaml";
import { CoreLog, LogLevel } from "../core/error";
import { yamlShardArgType } from ".";

/**
 * Structured root object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const rootType = type({
	data: type({ shards: arrayType(yamlShardArgType) }),
	kinds: recordType(stringType, type({ module: stringType, name: stringType }))
});

/**
 * Result of YAML compilation.
 */
export type RootType = TypeOf<typeof rootType>;

/**
 * Compiles binary string to arg.
 *
 * @param param - Destructured parameter
 * @returns Compilation result, or empty value if failed
 */
export function compile({
	data
}: {
	/**
	 * String data.
	 */
	data: string;
}): RootType {
	// Load YAML
	// eslint-disable-next-line @typescript-eslint/ban-types
	let loadResult: unknown = load(data);

	if (rootType.is(loadResult)) {
		return loadResult;
	}

	CoreLog.global.log({ error: new Error(`Failed to compile YAML`), level: LogLevel.Error });

	// Return default
	return { data: { shards: [] }, kinds: {} };
}
