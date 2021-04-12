/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Grid for the dungeons.
 */

import { cellUuidUrlPath, defaultCellVector, navAmount, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { CellPath } from "../comms/cell";
import { CommsGrid, CommsGridArgs } from "../comms/grid";
import { ServerCell, ServerCellArgs } from "./cell";
import { ServerProto } from "./proto";

/**
 * Arguments for the [[ServerGrid]].
 */
export interface ServerGridArgs extends CommsGridArgs {
	/**
	 *
	 */
	cells: Map<Uuid, ServerCellArgs>;
}

/**
 * The grid itself.
 */
export class ServerGrid extends ServerProto implements CommsGrid {
	/**
	 * Actual cells inside of the grid.
	 */
	public cells: Map<Uuid, ServerCell> = new Map();

	/**
	 * Default [[ServerEntity]] UUID.
	 */
	public defaultCellUuid: Uuid;

	/**
	 * Grid path.
	 */
	public readonly gridUuid: Uuid;

	/**
	 * Parent universe.
	 */
	public readonly shardUuid: Uuid;

	/**
	 * Initializes the server grid.
	 *
	 * @param worlds - The default world will be ignored, as it is already present by default.
	 */
	public constructor({ shardUuid, cells, gridUuid }: ServerGridArgs) {
		// ServerProto
		super();

		// Set path
		this.shardUuid = shardUuid;
		this.gridUuid = gridUuid;

		// Generate default
		this.defaultCellUuid = getDefaultUuid({
			path: `${cellUuidUrlPath}${urlPathSeparator}${this.shardUuid}`
		});

		setTimeout(() => {
			this.addCell({
				...this,
				cellUuid: this.defaultCellUuid,
				entities: new Map(),
				nav: new Array(navAmount).fill(this.defaultCellUuid),
				worlds: new Set(),
				...defaultCellVector
			});

			// Create cells
			cells.forEach(cell => {
				this.addCell(cell);
			});
		});
	}

	/**
	 * Adds [[ServerCell]].
	 *
	 * @param cell - Arguments for the [[ServerCell]] constructor
	 */
	public addCell(cell: ServerCellArgs): void {
		if (this.cells.has(cell.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveCell(cell);
		}
		this.cells.set(cell.cellUuid, new ServerCell(cell));
	}

	/**
	 * Gets [[ServerCell]].
	 *
	 * @returns [[ServerCell]], the cell within the grid
	 */
	public getCell({ cellUuid }: CellPath): ServerCell {
		let cell: ServerCell | undefined = this.cells.get(cellUuid);
		if (cell === undefined) {
			// The default is always preserved
			return this.cells.get(this.defaultCellUuid) as ServerCell;
		}
		return cell;
	}

	/**
	 * Removes [[ServerCell]].
	 *
	 * @param path - Path to the cell
	 */
	public removeCell(path: CellPath): void {
		if (path.cellUuid !== this.defaultCellUuid) {
			this.doRemoveCell(path);
		}
	}

	/**
	 * Terminates `this`.
	 */
	public terminate(): void {
		this.cells.forEach(function (cell) {
			cell.terminate();
		});
	}

	/**
	 * Actual removes [[ServerCell]]
	 */
	private doRemoveCell({ cellUuid }: CellPath): void {
		let cell: ServerCell | undefined = this.cells.get(cellUuid);
		if (cell !== undefined) {
			cell.terminate();
			this.cells.delete(cellUuid);
		}
	}
}
