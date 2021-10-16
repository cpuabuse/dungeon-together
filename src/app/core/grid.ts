/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Grid.
 */

import { Uuid } from "../common/uuid";
import { CoreArgsIds, CoreArgsOptionsUnion } from "./args";
import { CellPath, CommsCell, CommsCellArgs, CommsCellRaw, CoreCellArgs, commsCellRawToArgs } from "./cell";
import { ShardPath } from "./shard";

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
export type CoreGridArgs<O extends CoreArgsOptionsUnion> = (O[CoreArgsIds.Path] extends true
	? GridPath
	: GridOwnPath) & {
	/**
	 * Locations within the grid.
	 */
	cells: O[CoreArgsIds.Map] extends true ? Map<Uuid, CoreCellArgs<O>> : Array<CoreCellArgs<O>>;
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
	getCell(path: CellPath): CommsCell;

	/**
	 * Removes [[CommsCell]].
	 */
	removeCell(path: CellPath): void;

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
