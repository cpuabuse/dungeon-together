/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cells on screen.
 */

import { cellUuidUrlPath, defaultCellVector, defaultWorldUuid, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { CellPath, CommsCellArgs } from "../comms/cell";
import { CommsGrid, CommsGridArgs } from "../comms/grid";
import { ClientBaseClass } from "./base";
import { ClientCell } from "./cell";

/**
 * Generator for the client grid class.
 *
 * @returns Client grid class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientGridFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * Vector Array Object.
	 */
	class ClientGrid extends Base implements CommsGrid {
		/**
		 * Locations.
		 */
		public readonly cells: Map<Uuid, ClientCell> = new Map();

		/**
		 * UUID for default [[ClientGrid]].
		 */
		public readonly defaultCellUuid: Uuid;

		/**
		 * This id.
		 */
		public readonly gridUuid: Uuid;

		/**
		 *  Shard path.
		 */
		public readonly shardUuid: Uuid;

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

			// Entry to the universe's index
			this.universe.gridsIndex.set(this.gridUuid, this);
		}

		/**
		 * Adds [[CommsCell]].
		 *
		 * @param cell - Arguments for the [[ClientCell]] constructor
		 */
		public addCell(cell: CommsCellArgs): void {
			if (this.cells.has(cell.shardUuid)) {
				// Clear the shard if it already exists
				this.doRemoveCell(cell);
			}
			this.cells.set(cell.cellUuid, new this.universe.Cell(cell));
		}

		/**
		 * Shortcut to get the [[ClientCell]].
		 *
		 * @returns [[ClientCell]], a cell in the grid
		 */
		public getCell({ cellUuid }: CellPath): ClientCell {
			let clientCell: ClientCell | undefined = this.cells.get(cellUuid);
			// Default client cell is always there
			return clientCell === undefined ? (this.cells.get(this.defaultCellUuid) as ClientCell) : clientCell;
		}

		/**
		 * Removes the [[ClientCell]]
		 *
		 * @param uuid - UUID of the [[ClientCell]]
		 *
		 * @param path - Path to cell
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

			// Unset the index
			this.universe.gridsIndex.delete(this.gridUuid);
		}

		/**
		 * Updates grid.
		 */
		public update({ cells }: CommsGridArgs): void {
			cells.forEach(cell => {
				this.getCell(cell).update(cell);
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

	// Return the class
	return ClientGrid;
}

/**
 * Type of client grid class.
 */
export type ClientGridClass = ReturnType<typeof ClientGridFactory>;

/**
 * Instance type of client grid.
 */
export type ClientGrid = InstanceType<ClientGridClass>;
