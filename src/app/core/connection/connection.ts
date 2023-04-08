/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Virtual socket abstraction.
 */

import { Uuid } from "../../common/uuid";
import { CoreLog, LogLevel } from "../error";
import { ShardPathOwn } from "../shard";
import { CoreUniverseInstanceNonRecursive, CoreUniverseInstanceNonRecursiveWithConnections } from "../universe";
import { CoreMessage, CoreProcessCallback, CoreScheduler, CoreSocket, ToSuperclassCoreProcessCallback } from ".";

/**
 * Dictionary to transfer to players.
 */
export type CoreDictionary = Record<string, string | Array<string> | Record<string, string>>;

/**
 * Player data.
 */
export class CorePlayer<
	Universe extends CoreUniverseInstanceNonRecursive,
	ReceiveMessage extends CoreMessage,
	SendMessage extends CoreMessage
> {
	/** Whether the player is connected. */
	public connection?: CoreConnection<Universe, ReceiveMessage, SendMessage>;

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
	public connect(connection: CoreConnection<Universe, ReceiveMessage, SendMessage>): boolean {
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
type Player = {
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
 * Virtual socket abstraction.
 *
 * Emitter dispatches `tick()`; `tick()` performs processing, if `tock()` is not queued, otherwise `tick()` calls `tock()` asynchronously; `tock()` will requeue itself, if the process is not finished, while counting stack depth.
 */
export abstract class CoreConnection<
	Universe extends CoreUniverseInstanceNonRecursive,
	ReceiveMessage extends CoreMessage,
	SendMessage extends CoreMessage
> extends CoreScheduler {
	/** Connection UUID. */
	public connectionUuid: Uuid;

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

		if ((this.universe as CoreUniverseInstanceNonRecursiveWithConnections).connections.has(connectionUuid)) {
			(this.universe as CoreLog).log({
				level: LogLevel.Warning,
				message: `Connection UUID ${connectionUuid} already exists.`
			});
		}

		(this.universe as CoreUniverseInstanceNonRecursiveWithConnections).connections.set(connectionUuid, this);
	}

	/**
	 * Starts tracking shard in connection.
	 *
	 * @param param - Destructured parameter
	 */
	public registerShard({ shardUuid }: Player): void {
		this.shardUuids.add(shardUuid);
	}
}
