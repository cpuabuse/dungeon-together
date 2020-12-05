/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Grid.
 */

import { CellPath, CommsCell, CommsCellArgs } from "./cell";
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
export interface GridPath extends ShardPath {
	/**
	 * Grid uuid.
	 */
	gridUuid: Uuid;
}
