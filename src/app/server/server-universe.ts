/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * "Server" pool.
 */

import { Shard, ShardArgs } from "./shard";
import { defaultShardUuid, defaultKindUuid, defaultWorldUuid } from "../common/defaults";
import { ServerGrid } from "./server-grid";
import { ShardPath } from "../comms/comms-shard";
import { Kind } from "./kind";
import { CellPath } from "../comms/comms-cell";
import { GridPath } from "..comms/comms-grid";
import { EntityPath } from "../comms/comms-entity";
import { Place } from "./place";
import { CommsUniverse } from "../comms/comms-universe";
import { ServerProto } from "./server-proto";
import { Thing, DefaultEntity } from "./thing";
import { Uuid } from "../common/uuid";
import { World } from "./world";

/**
 * Arguments for a [[ServerUniverse]].
 */
export interface ServerUniverseArgs {
	worlds: Map<Uuid, World>;
}

/**
 * Server-side universe.
 */
export class ServerUniverse implements CommsUniverse {
	/**
	 * Shards.
	 */
	public readonly shards: Map<Uuid, Shard> = new Map();

	/**
	 * Entity kinds.
	 */
	private readonly kinds: Map<Uuid, Kind> = new Map([[defaultKindUuid, { typeOfEntity: DefaultEntity }]]);

	/**
	 * Game worlds.
	 */
	private readonly worlds: Map<Uuid, World> = new Map([[defaultWorldUuid, { kinds: new Set([defaultKindUuid]) }]]);

	/**
	 * Constructor.
	 */
	public constructor() {
		setTimeout(() => {
			// Set default shard
			this.addShard({ grids: new Map(), shardUuid: defaultShardUuid });
		});
	}

	/**
	 * Add shard to universe.
	 */
	public addShard(shard: ShardArgs): void {
		this.shards.set(shard.shardUuid, new ServerShard(shard));
	}

	/**
	 * Adds the kind.
	 */
	public addKind({ uuid, kind }: { uuid: Uuid; kind: Kind }): void {
		if (uuid !== defaultKindUuid) {
			this.doAddKind({ kind, uuid });
		}
	}

	/**
	 * Adds the world.
	 */
	public addWorld({ uuid, world }: { uuid: Uuid; world: World }): void {
		if (uuid !== defaultWorldUuid) {
			this.doAddWorld({ uuid, world });
		}
	}

	/**
	 * Get [[ServerShard]].
	 *
	 * A shortcut function.
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
	 * Gets the kind.
	 */
	public getKind({ uuid }: { uuid: Uuid }): Kind {
		let kind: Kind | undefined = this.kinds.get(uuid);
		if (kind === undefined) {
			// Default kind is always there
			return this.kinds.get(defaultKindUuid) as Kind;
		}
		return kind;
	}

	/**
	 * Get [[ServerCell]].
	 *
	 * A shortcut function.
	 */
	public getCell(path: CellPath): Place {
		return this.getShard(path).getGrid(path).getCell(path);
	}

	/**
	 * Get [[ServerGrid]].
	 *
	 * A shortcut function.
	 */
	public getGrid(path: GridPath): ServerGrid {
		return this.getShard(path).getGrid(path);
	}

	/**
	 * Get [[ServerEntity]].
	 *
	 * A shortcut function.
	 */
	public getEntity(path: EntityPath): Thing {
		return this.getShard(path).getGrid(path).getCell(path).getEntity(path);
	}

	/**
	 * Gets the world.
	 */
	public getWorld({ uuid }: { uuid: Uuid }): World {
		let world: World | undefined = this.worlds.get(uuid);
		if (world === undefined) {
			// Default world is always there
			return this.worlds.get(defaultWorldUuid) as World;
		}
		return world;
	}

	/**
	 * Remove shard from universe.
	 * @returns `true` on success, `false` on failure
	 */
	public removeShard(shard: ShardPath): void {
		this.doRemoveShard(shard);
	}

	/**
	 * Removes the kind.
	 */
	public removeKind({ uuid }: { uuid: Uuid }): void {
		if (uuid !== defaultKindUuid) {
			this.doRemoveKind({ uuid });
		}
	}

	/**
	 * Removes the world.
	 */
	public removeWorld({ uuid }: { uuid: Uuid }): void {
		if (uuid !== defaultWorldUuid) {
			this.doRemoveWorld({ uuid });
		}
	}

	/**
	 * Adds the kind.
	 */
	private doAddKind({ kind, uuid }: { kind: Kind; uuid: Uuid }): void {
		this.kinds.set(uuid, kind);
	}

	/**
	 * Adds the world.
	 */
	private doAddWorld({ uuid, world }: { uuid: Uuid; world: World }): void {
		this.worlds.set(uuid, world);
	}

	/**
	 * Actually removes the shard.
	 */
	private doRemoveShard({ shardUuid }: ShardPath): void {
		let shard: ClientShard | undefined = this.shards.get(shardUuid);
		if (shard !== undefined) {
			shard.terminate();
			this.shards.delete(shardUuid);
		}
	}

	/**
	 * Removes the kind.
	 */
	private doRemoveKind({ uuid }: { uuid: Uuid }): void {
		this.kinds.delete(uuid);
	}

	/**
	 * Removes the world.
	 */
	private doRemoveWorld({ uuid }: { uuid: Uuid }): void {
		this.worlds.delete(uuid);
	}
}

/**
 * Initialize the [[ServerUniverse]].
 *
 * Timeouts in [[ServerUniverse]] should be executed first.
 */
export async function InitServer(): Promise<void> {
	// Shards
	(ServerProto.prototype.universe as ServerUniverse) = new ServerUniverse();
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve();
		});
	});
}

/**
 * Gets the [[ServerShard]].
 *
 * @returns Shard or default shard
 */
export async function getShard(path: ShardPath): Promise<ServerShard> {
	return ServerProto.prototype.universe.getShard(path);
}
