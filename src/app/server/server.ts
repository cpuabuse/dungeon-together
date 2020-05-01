/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * "Server" pool.
 */

import { Shard, ShardArgs } from "./shard";
import { defaultInstanceUuid, defaultKindUuid, defaultWorldUuid } from "../common/defaults";
import { Area } from "./area";
import { InstancePath } from "../shared/comms/instance";
import { Kind } from "./kind";
import { LocusPath } from "../shared/comms/locus";
import { MappaPath } from "../shared/comms/mappa";
import { OccupantPath } from "../shared/comms/occupant";
import { Place } from "./place";
import { Pool } from "../shared/pool";
import { Serverable } from "./serverable";
import { Thing, DefaultThing } from "./thing";
import { Uuid } from "../common/uuid";
import { World } from "./world";

/**
 * Arguments for a [[Server]].
 */
export interface ServerArgs {
	worlds: Map<Uuid, World>;
}

/**
 * Server-side instance.
 */
export class Server implements Pool {
	/**
	 * Instances.
	 */
	public readonly instances: Map<Uuid, Shard> = new Map();

	/**
	 * Thing kinds.
	 */
	private readonly kinds: Map<Uuid, Kind> = new Map([[defaultKindUuid, { typeOfThing: DefaultThing }]]);

	/**
	 * Game worlds.
	 */
	private readonly worlds: Map<Uuid, World> = new Map([[defaultWorldUuid, { kinds: new Set([defaultKindUuid]) }]]);

	/**
	 * Constructor.
	 */
	public constructor() {
		setTimeout(() => {
			// Set default instance
			this.addInstance({ instanceUuid: defaultInstanceUuid, mappas: new Map() });
		});
	}

	/**
	 * Add instance to pool.
	 */
	public addInstance(instance: ShardArgs): void {
		this.instances.set(instance.instanceUuid, new Shard(instance));
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
	 * Get [[Shard]].
	 *
	 * A shortcut function.
	 */
	public getInstance({ instanceUuid }: InstancePath): Shard {
		let shard: Shard | undefined = this.instances.get(instanceUuid);

		if (shard === undefined) {
			// "defaultInstanceUuid" is always present, since it is initialized and cannot be removed or overwritten
			return this.instances.get(defaultInstanceUuid) as Shard;
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
	 * Get [[Place]].
	 *
	 * A shortcut function.
	 */
	public getLocus(path: LocusPath): Place {
		return this.getInstance(path).getMappa(path).getLocus(path);
	}

	/**
	 * Get [[Area]].
	 *
	 * A shortcut function.
	 */
	public getMappa(path: MappaPath): Area {
		return this.getInstance(path).getMappa(path);
	}

	/**
	 * Get [[Thing]].
	 *
	 * A shortcut function.
	 */
	public getOccupant(path: OccupantPath): Thing {
		return this.getInstance(path).getMappa(path).getLocus(path).getOccupant(path);
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
	 * Remove instance from pool.
	 * @returns `true` on success, `false` on failure
	 */
	public removeInstance(instance: InstancePath): void {
		this.doRemoveShard(instance);
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
	 * Actually removes the isntance.
	 */
	private doRemoveShard({ instanceUuid }: InstancePath): void {
		let shard: Shard | undefined = this.instances.get(instanceUuid);
		if (shard !== undefined) {
			shard.terminate();
			this.instances.delete(instanceUuid);
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
 * Initialize the [[Server]].
 *
 * Timeouts in [[Server]] should be executed first.
 */
export async function InitServer(): Promise<void> {
	// Instances
	(Serverable.prototype.pool as Server) = new Server();
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve();
		});
	});
}

/**
 * Gets the [[Shard]].
 *
 * @returns Shard or default shard
 */
export async function getShard(path: InstancePath): Promise<Shard> {
	return Serverable.prototype.pool.getInstance(path);
}
