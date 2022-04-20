/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Grid
 */

import { defaultShardUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreArgOptionIds, CoreArgOptions, CoreArgOptionsGenerate, CoreArgOptionsUnion } from "./arg/options";
import {
	CellPathExtended,
	CommsCell,
	CommsCellArgs,
	CommsCellRaw,
	CoreCellArg,
	commsCellRawToArgs,
	coreCellArgsConvert
} from "./cell";
import { ShardPath } from "./shard";

/**
 * Word referring to a grid.
 */
export type CoreGridWord = "Grid";

/**
 * A grid-like.
 */
export interface CommsGridArgs extends GridPath {
	/**
	 * Locations within the grid.
	 */
	cells: Map<Uuid, CommsCellArgs>;
}

/**
 * Type for physical data exchange.
 * Type is used as this is to be sent over internet.
 * Only JSON compatible member types can be used.
 */
export type CommsGridRaw = Omit<CommsGridArgs, "cells" | keyof ShardPath> & {
	/**
	 *
	 */
	cells: Array<CommsCellRaw>;
};

/**
 * Core grid args.
 */
export type CoreGridArgs<O extends CoreArgOptionsUnion = CoreArgOptions> = (O[CoreArgOptionIds.Path] extends true
	? GridPath
	: GridOwnPath) & {
	/**
	 * Locations within the grid.
	 */
	cells: O[CoreArgOptionIds.Map] extends true ? Map<Uuid, CoreCellArg<O>> : Array<CoreCellArg<O>>;
};

/**
 * Typeof class for grids.
 */
export type CoreGridClass = {
	new (...args: any[]): CommsGrid;
};

/**
 * Implementable [[CommsGridArgs]].
 */
export interface CommsGrid extends CommsGridArgs {
	/**
	 * Default [[Cell]] UUID.
	 */
	defaultCellUuid: Uuid;

	/**
	 * Adds [[CommsCell]].
	 */
	addCell(grid: CommsCellArgs): void;

	/**
	 * Gets [[CommsCell]].
	 */
	getCell(path: CellPathExtended): CommsCell;

	/**
	 * Removes [[CommsCell]].
	 */
	removeCell(path: CellPathExtended): void;

	/**
	 * Terminates `this`.
	 */
	terminate(): void;
}

/**
 * Core grid.
 */
export type CoreGrid = CommsGrid;

/**
 * Grid's own path.
 */
export interface GridOwnPath {
	/**
	 * Grid uuid.
	 */
	gridUuid: Uuid;
}

/**
 * Way to get to grid.
 */
export interface GridPath extends ShardPath, GridOwnPath {}

/**
 * Converts [[CommsGridRaw]] to [[CommsGridArgs]].
 *
 * @param rawSource
 * @param shardUuid
 */
export function commsGridRawToArgs(rawSource: CommsGridRaw, shardUuid: Uuid): CommsGridArgs {
	return {
		cells: new Map(
			rawSource.cells.map(function (cell) {
				return [
					cell.cellUuid,
					commsCellRawToArgs(cell, { cellUuid: cell.cellUuid, gridUuid: rawSource.gridUuid, shardUuid })
				];
			})
		),
		gridUuid: rawSource.gridUuid,
		shardUuid
	};
}

/**
 * Convert grid args between options.
 *
 * Has to strictly follow {@link CoreGridArgs}.
 *
 * @param param
 * @returns Converted grid args
 */
export function coreGridArgsConvert<S extends CoreArgOptionsUnion, T extends CoreArgOptionsUnion>({
	grid,
	sourceOptions,
	targetOptions
}: {
	/**
	 * Core grid args.
	 */
	grid: CoreGridArgs<S>;

	/**
	 * Option for the source.
	 */
	sourceOptions: S;

	/**
	 * Option for the target.
	 */
	targetOptions: T;
}): CoreGridArgs<T> {
	// Define source and result, with minimal options
	const sourceGrid: CoreGridArgs<S> = grid;
	const sourceGridAs: Record<string, any> = sourceGrid;
	// Cannot assign to conditional type without casting
	let targetGrid: CoreGridArgs<T> = {
		gridUuid: sourceGrid.gridUuid
	} as CoreGridArgs<T>;
	let targetGridAs: Record<string, any> = targetGrid;

	// Path
	if (targetOptions[CoreArgOptionIds.Path] === true) {
		/**
		 * Core grid args with path.
		 */
		type CoreGridArgsWithPath = CoreGridArgs<CoreArgOptionsGenerate<CoreArgOptionIds.Path>>;
		let targetGridWithPath: CoreGridArgsWithPath = targetGridAs as CoreGridArgsWithPath;

		if (sourceOptions[CoreArgOptionIds.Path] === true) {
			// Source to target
			targetGridWithPath.shardUuid = (sourceGridAs as CoreGridArgsWithPath).shardUuid;
		} else {
			// Default to target
			targetGridWithPath.shardUuid = defaultShardUuid;
		}
	}

	/**
	 * Core grid args options with map.
	 */
	type CoreGridArgsOptionsWithMap = CoreArgOptionsGenerate<CoreArgOptionIds.Map>;

	/**
	 * Core grid args options without map.
	 */
	type CoreGridArgsOptionsWithoutMap = CoreArgOptions;

	/**
	 * Core grid args with map.
	 */
	type CoreGridArgsWithMap = CoreGridArgs<CoreGridArgsOptionsWithMap>;

	/**
	 * Core grid args without map.
	 */
	type CoreGridArgsWithoutMap = CoreGridArgs<CoreGridArgsOptionsWithoutMap>;

	// Map
	if (targetOptions[CoreArgOptionIds.Map] === true) {
		let targetGridWithMap: CoreGridArgsWithMap = targetGridAs as CoreGridArgsWithMap;

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Map to map
			const sourceGridWithMap: CoreGridArgsWithMap = sourceGridAs as CoreGridArgsWithMap;

			// Cells
			targetGridWithMap.cells = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(sourceGridWithMap.cells, ([uuid, cell]) => [
					uuid,
					coreCellArgsConvert({
						cell,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreGridArgsOptionsWithMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreGridArgsOptionsWithMap
					})
				])
			);
		} else {
			// Array to map
			const sourceGridWithoutMap: CoreGridArgsWithoutMap = sourceGridAs as CoreGridArgsWithoutMap;

			// Cells
			targetGridWithMap.cells = new Map(
				sourceGridWithoutMap.cells.map(cell => [
					cell.cellUuid,
					coreCellArgsConvert({
						cell,
						// Cast to expected type
						sourceOptions: sourceOptions as CoreGridArgsOptionsWithoutMap,
						// Cast to expected type
						targetOptions: targetOptions as CoreGridArgsOptionsWithMap
					})
				])
			);
		}
	} else {
		let targetGridWithoutMap: CoreGridArgsWithoutMap = sourceGridAs as CoreGridArgsWithoutMap;

		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Map to array
			const sourceGridWithMap: CoreGridArgsWithMap = sourceGridAs as CoreGridArgsWithMap;

			// Grids
			targetGridWithoutMap.cells = Array.from(
				sourceGridWithMap.cells,
				// Argument types correctly inferred from "Array.from()", and UUID is unused, probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
				([uuid, cell]) =>
					// Set to actual type
					coreCellArgsConvert({
						cell,
						sourceOptions: sourceOptions as CoreGridArgsOptionsWithMap,
						targetOptions: targetOptions as CoreGridArgsOptionsWithoutMap
					})
			);
		} else {
			// Array to array
			const sourceGridWithoutMap: CoreGridArgsWithoutMap = sourceGridAs as CoreGridArgsWithoutMap;

			// Cells
			targetGridWithoutMap.cells = sourceGridWithoutMap.cells.map(cell =>
				// Set to actual type
				coreCellArgsConvert({
					cell,
					sourceOptions: sourceOptions as CoreGridArgsOptionsWithoutMap,
					targetOptions: targetOptions as CoreGridArgsOptionsWithoutMap
				})
			);
		}
	}
	// Return
	return targetGrid;
}
