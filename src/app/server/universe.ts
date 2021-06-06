/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server Universe.
 */

import { defaultKindUuid, defaultShardUuid, defaultWorldUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CellPath } from "../comms/cell";
import { CommsConnectionArgs } from "../comms/connection";
import { EntityPath } from "../comms/entity";
import { GridPath } from "../comms/grid";
import { ShardPath } from "../comms/shard";
import { CoreUniverse } from "../comms/universe";
import { ServerBaseClass, ServerBaseFactory } from "./base";
import { ServerCell, ServerCellClass, ServerCellFactory } from "./cell";
import { ServerConnection } from "./connection";
import {
	DefaultServerEntityFactory,
	ServerEntity,
	ServerEntityClassConcrete,
	ServerEntityClassOriginalAbstract,
	ServerEntityFactory
} from "./entity";
import { ServerGrid, ServerGridClass, ServerGridFactory } from "./grid";
import { Kind } from "./kind";
import { ServerShard, ServerShardArgs, ServerShardClass, ServerShardFactory } from "./shard";
import { World } from "./world";

/**
 * Arguments for a [[ServerUniverse]].
 */
export interface ServerUniverseArgs {
	/**
	 *
	 */
	worlds: Map<Uuid, World>;
}

/**
 * Server-side shard.
 */
export class ServerUniverse extends CoreUniverse {
	/**
	 * A shard constructor.
	 */
	public readonly Cell: ServerCellClass;

	/**
	 * A shard constructor.
	 */
	public readonly Entity: ServerEntityClassOriginalAbstract;

	/**
	 * A shard constructor.
	 */
	public readonly Grid: ServerGridClass;

	/**
	 * A shard constructor.
	 */
	public readonly Shard: ServerShardClass;

	/**
	 * Collection of connections.
	 */
	public connections: Set<ServerConnection> = new Set();

	/**
	 * Shards.
	 */
	public readonly shards: Map<Uuid, ServerShard> = new Map();

	/**
	 * Base class for server objects.
	 */
	protected readonly Base: ServerBaseClass;

	/**
	 * Entity kinds.
	 *
	 * Generate default factory once.
	 */
	private readonly kinds: Map<Uuid, Kind>;

	/**
	 * Game worlds.
	 */
	private readonly worlds: Map<Uuid, World> = new Map([[defaultWorldUuid, { kinds: new Set([defaultKindUuid]) }]]);

	/**
	 * Constructor.
	 */
	public constructor() {
		// Call superclass
		super();

		// Generate base class
		this.Base = ServerBaseFactory({ universe: this });

		// Generate object classes
		this.Shard = ServerShardFactory({ Base: this.Base });
		this.Grid = ServerGridFactory({ Base: this.Base });
		this.Cell = ServerCellFactory({ Base: this.Base });
		this.Entity = ServerEntityFactory({ Base: this.Base });

		// Set kinds
		this.kinds = new Map([
			[
				defaultKindUuid,
				{
					typeOfEntity: DefaultServerEntityFactory({
						Entity: this.Entity
					})
				}
			]
		]);

		setTimeout(() => {
			// Set default shard
			this.addShard({ grids: new Map(), shardUuid: defaultShardUuid });
		});
	}

	/**
	 * Adds connection, which subsequently adds a shard.
	 *
	 * @param connectionArgs - Connection args
	 * @returns - The connection added
	 */
	public addConnection(connectionArgs: CommsConnectionArgs): ServerConnection {
		let connection: ServerConnection = new ServerConnection(connectionArgs);
		this.connections.add(connection);
		return connection;
	}

	/**
	 * Adds the kind.
	 */
	public addKind({
		uuid,
		kind
	}: {
		/**
		 *
		 */
		uuid: Uuid;
		/**
		 *
		 */
		kind: Kind;
	}): void {
		if (uuid !== defaultKindUuid) {
			this.doAddKind({ kind, uuid });
		}
	}

	/**
	 * Add shard to CommsUniverse.
	 *
	 * @param shard - Arguments for the [[ServerShard]]
	 */
	public addShard(shard: ServerShardArgs): void {
		this.shards.set(shard.shardUuid, new this.Shard(shard));
	}

	/**
	 * Adds the world.
	 */
	public addWorld({
		uuid,
		world
	}: {
		/**
		 *
		 */
		uuid: Uuid;
		/**
		 *
		 */
		/**
		 *
		 */
		world: World;
	}): void {
		if (uuid !== defaultWorldUuid) {
			this.doAddWorld({ uuid, world });
		}
	}

	/**
	 * Get [[ServerCell]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to cell
	 *
	 * @returns [[ServerCell]], the cell within the grid
	 */
	public getCell(path: CellPath): ServerCell {
		return this.getShard(path).getGrid(path).getCell(path);
	}

	/**
	 * Get [[ServerEntity]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to entity
	 *
	 * @returns [[ServerEntity]], anything residing within a cell
	 */
	public getEntity(path: EntityPath): ServerEntity {
		return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
	}

	/**
	 * Get [[ServerGrid]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to grid
	 *
	 * @returns [[ServerGrid]], the grid itself
	 */
	public getGrid(path: GridPath): ServerGrid {
		return this.getShard(path).getGrid(path);
	}

	/**
	 * Gets the kind.
	 *
	 * @returns Kind
	 */
	public getKind({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): Kind {
		let kind: Kind | undefined = this.kinds.get(uuid);
		if (kind === undefined) {
			// Default kind is always there
			return this.kinds.get(defaultKindUuid) as Kind;
		}
		return kind;
	}

	/**
	 * Get [[ServerShard]].
	 *
	 * A shortcut function.
	 *
	 * @returns [[shard]], a whole universe
	 */
	public getShard({ shardUuid }: ShardPath): ServerShard {
		let shard: ServerShard | undefined = this.shards.get(shardUuid);

		if (shard === undefined) {
			// "defaultShardUuid" is always present, since it is initialized and cannot be removed or overwritten
			return this.shards.get(defaultShardUuid) as ServerShard;
		}
		return shard;
	}

	/**
	 * Gets the world.
	 *
	 * @returns [[World]], whole world
	 */
	public getWorld({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): World {
		let world: World | undefined = this.worlds.get(uuid);
		if (world === undefined) {
			// Default world is always there
			return this.worlds.get(defaultWorldUuid) as World;
		}
		return world;
	}

	/**
	 * Removes the kind.
	 */
	public removeKind({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): void {
		if (uuid !== defaultKindUuid) {
			this.doRemoveKind({ uuid });
		}
	}

	/**
	 * Remove commsShard from CommmsUniverse.
	 *
	 * @param shard - Path to shard
	 *
	 * @returns `true` on success, `false` on failure
	 */
	public removeShard(shard: ShardPath): void {
		this.doRemoveShard(shard);
	}

	/**
	 * Removes the world.
	 */
	public removeWorld({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): void {
		if (uuid !== defaultWorldUuid) {
			this.doRemoveWorld({ uuid });
		}
	}

	/**
	 * Adds the kind.
	 */
	private doAddKind({
		kind,
		uuid
	}: {
		/**
		 *
		 */
		kind: Kind;
		/**
		 *
		 */
		/**
		 *
		 */
		uuid: Uuid;
	}): void {
		this.kinds.set(uuid, kind);
	}

	/**
	 * Adds the world.
	 */
	private doAddWorld({
		uuid,
		world
	}: {
		/**
		 *
		 */
		uuid: Uuid;
		/**
		 *
		 */
		/**
		 *
		 */
		world: World;
	}): void {
		this.worlds.set(uuid, world);
	}

	/**
	 * Removes the kind.
	 */
	private doRemoveKind({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): void {
		this.kinds.delete(uuid);
	}

	/**
	 * Actually removes the commsShard.
	 */
	private doRemoveShard({ shardUuid }: ShardPath): void {
		let shard: ServerShard | undefined = this.shards.get(shardUuid);
		if (shard !== undefined) {
			shard.terminate();
			this.shards.delete(shardUuid);
		}
	}

	/**
	 * Removes the world.
	 */
	private doRemoveWorld({
		uuid
	}: {
		/**
		 *
		 */
		uuid: Uuid;
	}): void {
		this.worlds.delete(uuid);
	}
}

/**
 * Initialize the [[ServerUniverse]].
 *
 * Timeouts in [[ServerUniverse]] should be executed first.
 *
 * @returns Promise, containing a universe
 */
export async function initUniverse(): Promise<ServerUniverse> {
	// Shards
	let universe: ServerUniverse = new ServerUniverse();
	// TS will infer the type of resolve parameter from generic
	// eslint-disable-next-line @typescript-eslint/typedef
	return new Promise<ServerUniverse>(function (resolve) {
		setTimeout(function () {
			resolve(universe);
		});
	});
}
