/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Cells on screen.
 */

import { CellPath, CommsCellArgs } from "../comms/comms-cell";
import { CommsGrid, CommsGridArgs } from "../comms/comms-grid";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { cellUuidUrlPath, defaultCellVector, defaultWorldUuid, urlPathSeparator } from "../common/defaults";
import { ClientCell } from "./client-cell";
import { ClientProto } from "./client-proto";

/**
 * Vector Array Object.
 */
export class ClientGrid extends ClientProto implements CommsGrid {
	/**
	 * UUID for default [[ClientGrid]].
	 */
	public readonly defaultCellUuid: Uuid;

	/**
	 *  Shard path.
	 */
	public readonly shardUuid: Uuid;

	/**
	 * Locations.
	 */
	public readonly cells: Map<Uuid, ClientCell> = new Map();

	/**
	 * This id.
	 */
	public readonly gridUuid: Uuid;

	/**
	 * Constructor.
	 */
	public constructor({ shardUuid, cells, gridUuid }: CommsGridArgs) {
		super();

		// Assign path
		this.shardUuid = shardUuid;
		this.gridUuid = gridUuid;

		// Set default Uuid
		this.shardUuid = shardUuid;
		this.defaultCellUuid = getDefaultUuid({ path: `${cellUuidUrlPath}${urlPathSeparator}${this.gridUuid}` });

		setTimeout(() => {
			// Set default cell
			this.addCell({
				// Take path from this
				...this,
				cellUuid: this.defaultCellUuid,
				entities: new Map(),
				worlds: new Set([defaultWorldUuid]),
				...defaultCellVector
			});

			cells.forEach(cell => {
				this.addCell(cell);
			});
		});
	}

	/**
	 * Adds [[CommsCell]].
	 */
	public addCell(cell: CommsCellArgs): void {
		if (this.cells.has(cell.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveCell(cell);
		}
		this.cells.set(cell.cellUuid, new ClientCell(cell));
	}

	/**
	 * Shortcut to get the [[ClientCell]].
	 */
	public getCell({ cellUuid }: CellPath): ClientCell {
		let clientCell: ClientCell | undefined = this.cells.get(cellUuid);
		// Default client cell is always there
		return clientCell === undefined ? (this.cells.get(this.defaultCellUuid) as ClientCell) : clientCell;
	}

	/**
	 * Removes the [[ClientCell]]
	 * @param uuid UUID of the [[ClientCell]]
	 */
	public removeCell(path: CellPath): void {
		if (path.cellUuid !== this.defaultCellUuid) {
			this.doRemoveCell(path);
		}
	}

	/**
	 * Performs the necessary cleanup when removed.
	 */
	public terminate(): void {
		this.cells.forEach(clientCell => {
			this.doRemoveCell(clientCell);
		});
	}

	/**
	 * Actually remove the [[ClientCell]] instance from "cells".
	 */
	private doRemoveCell({ cellUuid }: CellPath): void {
		let cell: ClientCell | undefined = this.cells.get(cellUuid);
		if (cell !== undefined) {
			cell.terminate();
			this.cells.delete(cellUuid);
		}
	}
}
