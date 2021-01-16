/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Grid.
 */

import { CellPath, CommsCell, CommsCellArgs, CommsCellRaw } from "./cell";
import { CommsProto } from "./proto";
import { ShardPath } from "./shard";
import { Uuid } from "../common/uuid";

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
	cells: Array<CommsCellRaw>;
};

/**
 * Implementable [[CommsGridArgs]].
 */
export interface CommsGrid extends CommsGridArgs, CommsProto {
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
 * Way to get to grid.
 */
export interface GridPath {
	/**
	 * Grid uuid.
	 */
	gridUuid: Uuid;
}

/**
 * Converts [[CommsGridRaw]] to [[CommsGridArgs]].
 */
export function commsGridRawToArgs(rawSource: CommsGridRaw): CommsGridArgs {
	return { cells: new Map(), gridUuid: rawSource.gridUuid };
}

/**
 * Converts [[CommsGridArgs]] to [[CommsGridRaw]].
 */
export function commsGridArgsToRaw(argsSource: CommsGridArgs): CommsGridRaw {
	return { cells: new Array(), gridUuid: argsSource.gridUuid };
}
