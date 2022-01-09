/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Raw pre-conversion data
 */

import { sep } from "path";
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
import { CoreArgMeta, CoreArgOptionIds, coreArgOptionIdsToOptions } from "../core/arg";

/**
 * Raw arg options.
 */
export type RawArgOptions = typeof rawArgOptions;

/**
 * Args options for compilation output.
 */
// Infer to save lines
// eslint-disable-next-line @typescript-eslint/typedef
export const rawArgOptions = coreArgOptionIdsToOptions({
	idSet: new Set([CoreArgOptionIds.Kind, CoreArgOptionIds.Path, CoreArgOptionIds.Vector] as const)
});

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
