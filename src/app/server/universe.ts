/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server Universe.
 */

import { defaultKindUuid, defaultShardUuid, defaultWorldUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreUniverseClassFactory, CoreUniverseRequiredConstructorParameter } from "../core/universe";
import { ServerBaseClass, ServerBaseConstructorParams, ServerBaseFactory } from "./base";
import { ServerCell, ServerCellFactory } from "./cell";
import { ServerConnection } from "./connection";
import { ServerEntity, ServerEntityFactory } from "./entity";
import { ServerGrid, ServerGridClass, ServerGridFactory } from "./grid";
import { Kind } from "./kind";
import { ServerOptions, serverOptions } from "./options";
import { ServerShard, ServerShardArgs, ServerShardClass, ServerShardFactory } from "./shard";
import { World } from "./world";

/**
 * Constructor args for server universe.
 */
export type ServerUniverseArgs = CoreUniverseRequiredConstructorParameter;

/**
 * Server-side shard.
 */
export class ServerUniverse extends CoreUniverseClassFactory<
	ServerBaseClass,
	ServerBaseConstructorParams,
	ServerOptions,
	ServerEntity,
	ServerCell
	// ServerGrid,
	// ServerShard
>({ options: serverOptions }) {
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
	 *
	 * @param param
	 */
	public constructor({ application }: ServerUniverseArgs) {
		// Call superclass
		super({ application });

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
	public addConnection(connectionArgs: CoreConnectionParam): ServerConnection {
		let connection: ServerConnection = new ServerConnection(connectionArgs);
		this.connections.add(connection);
		return connection;
	}

	/**
	 * Adds the kind.
	 *
	 * @param param
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
	 *
	 * @param param
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
	 * Get [[ServerEntity]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to entity
	 * @returns [[ServerEntity]], anything residing within a cell
	 */
	public getEntity(path: EntityPathExtended): ServerEntity {
		return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
	}

	/**
	 * Get [[ServerGrid]].
	 *
	 * A shortcut function.
	 *
	 * @param path - Path to grid
	 * @returns [[ServerGrid]], the grid itself
	 */
	public getGrid(path: GridPath): ServerGrid {
		return this.getShard(path).getGrid(path);
	}

	/**
	 * Gets the kind.
	 *
	 * @param param
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
	 * @param param
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
	 * @param param
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
	 *
	 * @param param
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
	 * @returns `true` on success, `false` on failure
	 */
	public removeShard(shard: ShardPath): void {
		this.doRemoveShard(shard);
	}

	/**
	 * Removes the world.
	 *
	 * @param param
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
	 *
	 * @param param
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
	 *
	 * @param param
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
	 *
	 * @param param
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
	 *
	 * @param param
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
	 *
	 * @param param
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
