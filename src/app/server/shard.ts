/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file A universe with everything.
 */

import { gridUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { GridPath } from "../comms/grid";
import { CommsShard, CommsShardArgs } from "../comms/shard";
import { CoreUniverse } from "../comms/universe";
import { ServerBaseClass } from "./base";
import { ServerConnection } from "./connection";
import { ServerGrid, ServerGridArgs } from "./grid";

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
 * Created a Server shard class.
 *
 * Static members initialization cannot reference base universe class.
 *
 * @param Universe - Server universe class
 * @returns Server shard class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerShardFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * A whole universe.
	 */
	class ServerShard extends Base implements CommsShard {
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
		 * Adds [[ServerGrid]].
		 *
		 * @param grid - Arguments for the [[ServerGrid]] constructor
		 */
		public addGrid(grid: ServerGridArgs): void {
			if (this.grids.has(grid.gridUuid)) {
				// Clear the shard if it already exists
				this.doRemoveGrid(grid);
			}
			this.grids.set(grid.gridUuid, new this.universe.Grid(grid));
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

	// Return class
	return ServerShard;
}

/**
 * Type of server shard class.
 */
export type ServerShardClass = ReturnType<typeof ServerShardFactory>;

/**
 * Instance type of server shard.
 */
export type ServerShard = InstanceType<ServerShardClass>;
