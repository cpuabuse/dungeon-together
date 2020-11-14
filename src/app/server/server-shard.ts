/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A universe with everything.
 */

import { Area, AreaArgs } from "./area";
import { CommsShard, CommsShardeArgs } from "../comms/comms-shard";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { mappaUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { ClientConnection } from "../client/connection";
import { MappaPath } from "../shared/comms/mappa";
import { ServerConnection } from "./connection";
import { Serverable } from "./serverable";
import { ServerProto } from "./server-proto";
import { CommsShard } from "../comms/comms-shard";

/**
 * Universe args.
 */
export interface ServerShardArgs extends CommsShardArgs {
	mappas: Map<Uuid, AreaArgs>;
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
	public constructor({ shardeUuid, grids }: CommsShardArgs) {
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

			grids.forEach(serverGrid => {
				this.addGrid(serverGrid);
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
	public addGrid(grid
		if (this.grids.has(grid.gridUuid)) {
			// Clear the shard if it already exists
			this.doRemoveGrid(grid);
		}
		this.mappas.set(mappa.mappaUuid, new Area(mappa));
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
		this.grids.forEach(function (serverGrid) {
			serverGrid.terminate();
		});
	}

	/**
	 * Actual removes [[ServerCell]]
	 */
	private doRemoveGrid({ gridUuid }: GridPath): void {
		let serverGrid: ServerArea | undefined = this.grids.get(gridUuid);
		if (serverGrid !== undefined) {
			serverGrid.terminate();
			this.grids.delete(gridUuid);
		}
	}
}
