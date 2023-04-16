/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Virtual socket abstraction.
 */

import { Uuid } from "../../common/uuid";
import { LogLevel } from "../error";
import { ShardPathOwn } from "../shard";
import { CoreUniverseInstanceNonRecursive, CoreUniverseInstanceNonRecursiveCast } from "../universe";
import { CoreMessage, CoreProcessCallback, CoreScheduler, CoreSocket, ToSuperclassCoreProcessCallback } from ".";

/**
 * Dictionary to transfer to players.
 */
export type CoreDictionary = Record<
	string,
	number | string | Array<string> | Array<number> | Record<string, string | number>
>;

/**
 * Container of players.
 */
export type CorePlayerContainer<Player extends CorePlayer = CorePlayer> = {
	/**
	 * Players.
	 */
	players: Map<Uuid, Player>;
};

/**
 * Player data.
 */
export class CorePlayer<
	Connection extends CoreConnection<CoreUniverseInstanceNonRecursive, CoreMessage, CoreMessage> = any
> {
	/** Whether the player is connected. */
	public connection?: Connection;

	/** Player dictionary. */
	public dictionary: CoreDictionary = {};

	/** Player UUID. */
	public playerUuid: Uuid;

	/** Player controlled units. */
	public units: Set<Uuid> = new Set();

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		playerUuid
	}: {
		/**
		 * Player UUID.
		 */
		playerUuid: Uuid;
	}) {
		this.playerUuid = playerUuid;
	}

	/**
	 * Connect player to connection.
	 *
	 * @param connection - Connection to connect to
	 * @returns Whether the player was connected
	 */
	public connect(connection: Connection): boolean {
		if (this.isConnected()) return false;
		this.connection = connection;
		return true;
	}

	/**
	 * Disconnect player from connection.
	 *
	 * @remarks
	 * Only does the player part, not the connection part.
	 */
	public disconnect(): void {
		this.connection = undefined;
	}

	/**
	 * Whether the player is connected.
	 *
	 * @returns Whether the player is connected
	 */
	public isConnected(): this is Required<Pick<this, "connection">> {
		return Boolean(this.connection);
	}
}

/**
 * Players referenced by connection.
 *
 * @remarks
 * Not a set of direct references but a set of UUIDs, since referencing through shard, which is a universe object.
 */
type PlayerArgs = {
	/**
	 * Player UUID.
	 */
	playerUuid: Uuid;
} & ShardPathOwn;

/**
 * Arguments for constructor of core connection.
 */
export type CoreConnectionArgs<
	Universe extends CoreUniverseInstanceNonRecursive,
	ReceiveMessage extends CoreMessage,
	SendMessage extends CoreMessage
> = {
	/**
	 * Optional callback.
	 */
	callback: CoreProcessCallback<CoreConnection<Universe, ReceiveMessage, SendMessage>>;

	/**
	 * Universe to initialize socket with.
	 */
	universe: Universe;

	/**
	 * Socket.
	 */
	socket: CoreSocket<ReceiveMessage, SendMessage>;

	/** Connection UUID. */
	connectionUuid: Uuid;
};

/**
 * Player entry for connection.
 */
type PlayerEntry<Player extends CorePlayer = CorePlayer> = {
	/**
	 * Shard UUID.
	 */
	shardUuid: Uuid;

	/**
	 * Player UUID.
	 */
	player: Player;
};

/**
 * Virtual socket abstraction.
 *
 * Emitter dispatches `tick()`; `tick()` performs processing, if `tock()` is not queued, otherwise `tick()` calls `tock()` asynchronously; `tock()` will requeue itself, if the process is not finished, while counting stack depth.
 */
export abstract class CoreConnection<
	Universe extends CoreUniverseInstanceNonRecursive = CoreUniverseInstanceNonRecursive,
	ReceiveMessage extends CoreMessage = CoreMessage,
	SendMessage extends CoreMessage = CoreMessage,
	Player extends CorePlayer<CoreConnection<Universe, ReceiveMessage, SendMessage>> = any
> extends CoreScheduler {
	/** Connection UUID. */
	public connectionUuid: Uuid;

	/** Map of player UUIDs to player entries. */
	public playerEntries: Map<Uuid, PlayerEntry<Player>> = new Map();

	/** Shard UUIDs for registration uniqueness. */
	public shardUuids: Set<Uuid> = new Set();

	/** Socket. */
	public socket: CoreSocket<ReceiveMessage, SendMessage>;

	/**
	 * Universe socket.
	 */
	public universe: Universe;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback to call on queue updates
	 */
	public constructor({
		callback,
		universe,
		socket,
		connectionUuid
	}: CoreConnectionArgs<Universe, ReceiveMessage, SendMessage>) {
		super({ callback: callback as ToSuperclassCoreProcessCallback<typeof callback, CoreScheduler> });
		this.universe = universe;
		this.socket = socket;
		// TODO: Replace with game tick
		this.socket.connection = this;
		this.connectionUuid = connectionUuid;

		if ((this.universe as CoreUniverseInstanceNonRecursiveCast).connections.has(connectionUuid)) {
			(this.universe as CoreUniverseInstanceNonRecursiveCast).log({
				level: LogLevel.Warning,
				message: `Connection UUID ${connectionUuid} already exists.`
			});
		}

		(this.universe as CoreUniverseInstanceNonRecursiveCast).connections.set(connectionUuid, this);
	}

	/**
	 * Starts tracking shard in connection.
	 *
	 * @param param - Destructured parameter
	 * @returns Success
	 */
	public registerShard({ shardUuid, playerUuid }: PlayerArgs): boolean {
		let player: Player | undefined = (this.universe as CoreUniverseInstanceNonRecursiveCast<this>).shards
			.get(shardUuid)
			?.players.get(playerUuid);

		if (player && player.connect(this)) {
			this.shardUuids.add(shardUuid);
			this.playerEntries.set(playerUuid, { player, shardUuid });
			return true;
		}

		(this.universe as CoreUniverseInstanceNonRecursiveCast).log({
			level: LogLevel.Error,
			message: `Could not register player(uuid="${playerUuid}") to shard(uuid="${shardUuid}").`
		});
		return false;
	}
}
