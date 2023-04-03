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
export type CorePlayer = {
	/**
	 * Player dictionary.
	 */
	dictionary: CoreDictionary;

	/**
	 * Whether the player is connected.
	 */
	isConnected: boolean;

	/**
	 * Player controlled units.
	 */
	units: Set<Uuid>;
};

/**
 * Default empty player.
 */
export const defaultPlayer: CorePlayer = {
	dictionary: {},
	isConnected: false,
	units: new Set()
};

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

	/**
	 * Socket.
	 */
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
	 * Helper function, executes callback for each shard.
	 *
	 * @param callback - Callback to execute
	 * @returns - Array of return values from callback
	 */
	public abstract forEachShard<Return>(callback: (shard: ShardPathOwn) => Return): Array<Return>;

	/**
	 * Starts tracking shard in connection.
	 *
	 * @param param - Destructured parameter
	 */
	public abstract registerShard({ shardUuid, playerUuid }: Player): void;
}
