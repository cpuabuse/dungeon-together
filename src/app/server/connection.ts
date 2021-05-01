/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Server connection to client.
 */

import { Uuid } from "../common/uuid";
import { VSocket } from "../common/vsocket";
import { CommsConnection, CommsConnectionArgs } from "../comms/connection";

/**
 * Server connection.
 */
export class ServerConnection implements CommsConnection {
	/**
	 * Server shards.
	 */
	public shardUuids: Set<Uuid> = new Set();

	/**
	 * The target, be it standalone, remote or absent.
	 */
	public socket: VSocket;

	/**
	 * Constructor.
	 *
	 * @param target - Socket
	 */
	public constructor({ socket }: CommsConnectionArgs) {
		// Set this target
		this.socket = socket;
	}
}
