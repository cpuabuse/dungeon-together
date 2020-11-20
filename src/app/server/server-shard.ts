/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A universe with everything.
 */

import { CommsShard, CommsShardArgs } from "../comms/comms-shard";
import { ServerGrid, ServerGridArgs } from "./server-grid";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { gridUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { ClientConnection } from "../client/connection";
import { GridPath } from "../comms/comms-grid";
import { ServerConnection } from "./connection";
import { ServerProto } from "./server-proto";

/**
 * Universe args.
 */
export interface ServerShardArgs extends CommsShardArgs {
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
	 * This UUID.
	 */
	public shardUuid: Uuid;

	/**
	 * Grids of the universe.
	 */
	public grids: Map<Uuid, ServerGrid> = new Map();

	/**
	 * Constructor.
	 */
	public constructor({ shardUuid, grids }: CommsShardArgs) {
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
	 */
	public addConnection({
		canvasUuid,
		connection,
		standalone
	}: {
		canvasUuid: Uuid;
		connection: WebSocket | ClientConnection;
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
