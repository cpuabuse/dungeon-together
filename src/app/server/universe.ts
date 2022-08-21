/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server Universe.
 */

import { DeferredPromise } from "../common/async";
import { defaultKindUuid, defaultWorldUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { CoreShardArg } from "../core/shard";
import { CoreUniverseClassFactory, CoreUniverseRequiredConstructorParameter } from "../core/universe";
import { ServerBaseClass, ServerBaseConstructorParams, ServerBaseFactory } from "./base";
import { ServerCell, ServerCellClass, ServerCellFactory } from "./cell";
import { ServerEntity, ServerEntityClass, ServerEntityFactory } from "./entity";
import { ServerGrid, ServerGridClass, ServerGridFactory } from "./grid";
import { ServerOptions, serverOptions } from "./options";
import { ServerShard, ServerShardClass, ServerShardFactory } from "./shard";
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
	ServerCell,
	ServerGrid,
	ServerShard
>({ logSource: "Server", options: serverOptions }) {
	/**
	 * Base class for server objects.
	 */
	public readonly Base: ServerBaseClass;

	/**
	 * A shard constructor.
	 */
	public readonly Cell: ServerCellClass;

	/**
	 * A shard constructor.
	 */
	public readonly Entity: ServerEntityClass;

	/**
	 * A shard constructor.
	 */
	public readonly Grid: ServerGridClass;

	/**
	 * A shard constructor.
	 */
	public readonly Shard: ServerShardClass;

	/**
	 * Default shard.
	 */
	public defaultShard: ServerShard;

	/**
	 * Game worlds.
	 */
	private readonly worlds: Map<Uuid, World> = new Map([[defaultWorldUuid, { kinds: new Set([defaultKindUuid]) }]]);

	/**
	 * Constructor.
	 *
	 * @param superParams - Super parameters
	 * @param param - Destructured parameters
	 */
	public constructor(
		superParams: CoreUniverseRequiredConstructorParameter,
		{
			created
		}: {
			/**
			 * Created promise.
			 */
			created: DeferredPromise<void>;
		}
	) {
		// Call superclass
		super(superParams);

		// Generate base class
		this.Base = ServerBaseFactory({ universe: this });

		// Generate object classes
		this.Shard = ServerShardFactory({ Base: this.Base });
		this.Grid = ServerGridFactory({ Base: this.Base });
		this.Cell = ServerCellFactory({ Base: this.Base });
		this.Entity = ServerEntityFactory({ Base: this.Base });

		// Default shard
		let defaultShardCreated: DeferredPromise = new DeferredPromise();
		let defaultShardAttach: Promise<void> = new Promise((resolve, reject) => {
			defaultShardCreated.then(resolve).catch(reject);
		});
		let defaultShardArg: CoreShardArg<ServerOptions> = {
			grids: new Map(),
			shardUuid: this.getDefaultShardUuid()
		};
		this.defaultShard = this.addShard(
			defaultShardArg,
			{ attachHook: defaultShardAttach, created: defaultShardCreated },
			[]
		);

		// After default shard added, resolve universe creation
		defaultShardAttach
			.catch(() => {
				// TODO: Process error
			})
			// Process unconditionally
			.finally(() => {
				created.resolve();
			});
	}
}

/**
 * Server universe class.
 */
export type ServerUniverseClass = typeof ServerUniverse;
