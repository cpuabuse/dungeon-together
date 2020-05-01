/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { ClientConnection } from "../client/connection";
import { Shard } from "./shard";
import { Uuid } from "../common/uuid";

/**
 * Server connection to client.
 */

/**
 * Arguments for connection.
 */
export interface ServerConnectionArgs {
	/**
	 * Client UUID.
	 */
	canvasUuid: Uuid;

	connection: WebSocket | ClientConnection;
	/**
	 * Shard.
	 */
	shard: Shard;
	standalone?: boolean;
}
/**
 * Server connection.
 */
export class ServerConnection {
	/**
	 * Client UUID.
	 */
	public canvasUuid: Uuid;

	/**
	 * Shard.
	 */
	public shard: Shard;

	/**
	 * Socket or client connection.
	 */
	public connection: WebSocket | ClientConnection;

	/**
	 * If this is a standalone connection.
	 */
	public standalone: boolean = false;

	/**
	 * Constructor.
	 */
	public constructor({ canvasUuid, shard, connection, standalone }: ServerConnectionArgs) {
		// Set standalone
		if (standalone !== undefined) {
			this.standalone = standalone;
		}

		// Set UUID
		this.canvasUuid = canvasUuid;

		// Set shard
		this.shard = shard;

		// Set socket
		this.connection = connection;
	}

	/**
	 * Terminates itself.
	 */
	public terminate(): void {}
}
