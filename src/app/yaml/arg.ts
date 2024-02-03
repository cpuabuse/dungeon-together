/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Args for file options.
 *
 * @file
 */

import {
	array as arrayType,
	intersection as intersectionType,
	number as numberType,
	partial as partialType,
	string as stringType,
	type,
	TypeOf as typeOf
} from "io-ts";

/**
 * Structured object that contains id.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
const pathType = partialType({ id: stringType });

/**
 * Structured entity object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const yamlEntityArgType = intersectionType([
	partialType({
		mode: stringType,
		world: stringType
	}),
	type({ kind: stringType }),
	pathType
]);

/**
 * Structured cell object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const yamlCellArgType = intersectionType([
	type({
		entities: arrayType(yamlEntityArgType),
		x: numberType,
		y: numberType,
		z: numberType
	}),
	pathType
]);

/**
 * Structured grid object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const yamlGridArgType = intersectionType([
	type({
		cells: arrayType(yamlCellArgType),
		worlds: arrayType(stringType),
		x: numberType,
		y: numberType,
		z: numberType
	}),
	pathType
]);

/**
 * Structured shard object.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const yamlShardArgType = intersectionType([
	type({
		grids: arrayType(yamlGridArgType)
	}),
	pathType
]);

/**
 * The shard from YAML.
 */
export type YamlShardArg = typeOf<typeof yamlShardArgType>;

/**
 * The grid from YAML.
 */
export type YamlGridArg = typeOf<typeof yamlGridArgType>;

/**
 * The cell from YAML.
 */
export type YamlCellArg = typeOf<typeof yamlCellArgType>;

/**
 * The entity from YAML.
 */
export type YamlEntityArg = typeOf<typeof yamlEntityArgType>;
