/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file A universe with everything.
 */

import { ClientConnection } from "../client/connection";
import { gridUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { GridPath } from "../comms/grid";
import { CommsShard, CommsShardArgs } from "../comms/shard";
import { ServerConnection } from "./connection";
import { ServerGrid, ServerGridArgs } from "./grid";
import { ServerProto } from "./proto";

/**
 * Universe args.
 */
export interface ServerShardArgs extends CommsShardArgs {
	/**
	 *
	 */
	grids: Map<Uuid, ServerGridArgs>;
}

/**
 * A whole universe.
 */
export class ServerShard extends ServerProto implements CommsShard {
	/**
	 * Connection to client.
	 */
	public connection: Map<Uuid, ServerConnection> = new Map();

	/**
	 * Default [[ServerGrid]] UUID.
	 */
	public defaultGridUuid: Uuid;

	/**
	 * Grids of the universe.
	 */
	public grids: Map<Uuid, ServerGrid> = new Map();

	/**
	 * This UUID.
	 */
	public shardUuid: Uuid;

	/**
	 * Constructor.
	 */
	public constructor({ shardUuid, grids }: ServerShardArgs) {
		// ServerProto
		super();

		// Set path
		this.shardUuid = shardUuid;

		// Deal with default
		this.defaultGridUuid = getDefaultUuid({
			path: `${gridUuidUrlPath}${urlPathSeparator}${this.shardUuid}`
		});
		setTimeout(() => {
			this.addGrid({ ...this, cells: new Map(), gridUuid: this.defaultGridUuid });

			grids.forEach(grid => {
				this.addGrid(grid);
			});
		});
	}

	/**
	 * Add a connection.
	 *
	 * @returns [[serverConnection]], a connection to the server
	 */
	public addConnection({
		canvasUuid,
		connection,
		standalone
	}: {
		/**
		 *
		 */
		canvasUuid: Uuid;
		/**
		 *
		 */
		connection: WebSocket | ClientConnection;
		/**
		 *
		 */
		standalone?: boolean;
	}): ServerConnection {
		if (this.connection.has(canvasUuid)) {
			(this.connection.get(canvasUuid) as ServerConnection).terminate();
		}
		let serverConnection: ServerConnection = new ServerConnection({
			canvasUuid,
			connection,
			shard: this,
			standalone
		});
		this.connection.set(canvasUuid, serverConnection);
		return serverConnection;
	}

	/**
	 * Adds [[ServerGrid]].
	 *
	 * @param grid - Arguments for the [[ServerGrid]] constructor
	 */
	public addGrid(grid: ServerGridArgs): void {
		if (this.grids.has(grid.gridUuid)) {
			// Clear the shard if it already exists
			this.doRemoveGrid(grid);
		}
		this.grids.set(grid.gridUuid, new ServerGrid(grid));
	}

	/**
	 * Gets [[ServerGrid]].
	 *
	 * @returns [[grid]], the grid itself
	 */
	public getGrid({ gridUuid }: GridPath): ServerGrid {
		let grid: ServerGrid | undefined = this.grids.get(gridUuid);
		if (grid === undefined) {
			// The default is always preserved
			return this.grids.get(this.defaultGridUuid) as ServerGrid;
		}
		return grid;
	}

	/**
	 * Removes [[CommsGrid]].
	 *
	 * @param path - Path to grid
	 */
	public removeGrid(path: GridPath): void {
		if (path.gridUuid !== this.defaultGridUuid) {
			this.doRemoveGrid(path);
		}
	}

	/**
	 * Terminates `this`.
	 */
	public terminate(): void {
		this.grids.forEach(function (grid) {
			grid.terminate();
		});
	}

	/**
	 * Actual removes [[ServerCell]]
	 */
	private doRemoveGrid({ gridUuid }: GridPath): void {
		let grid: ServerGrid | undefined = this.grids.get(gridUuid);
		if (grid !== undefined) {
			grid.terminate();
			this.grids.delete(gridUuid);
		}
	}
}
