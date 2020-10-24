/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Grid.
 */

import { CommsCell, CommsCellArgs, CellPath } from "./comms-cell";
import { ShardPath } from "./comms-shard";
import { Uuid } from "../../common/uuid";

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
 * Way to get to grid.
 */
export interface GridPath extends ShardPath {
	/**
	 * Grid uuid.
	 */
	gridUuid: Uuid;
}
