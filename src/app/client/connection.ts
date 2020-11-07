/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { defaultShardUuid, defaultServerUrl } from "../common/defaults";
import { Server } from "../server/server";
import { ServerConnection } from "../server/connection";
import { Uuid } from "../common/uuid";

/**
 * Client connection to server.
 */

/**
 * Arguments for [[ClientConnection]].
 */
export interface ClientConnectionArgs {
	canvasUuid: Uuid;
	shardUuid?: Uuid;
	standalone?: boolean;
	url?: string;
}

/**
 * Client connection.
 */
export class ClientConnection {
	/**
	 * Socket abstraction.
	 */
	public connection: WebSocket | ServerConnection;

	/**
	 * Standalone or not.
	 */
	public standalone: boolean = false;

	/**
	 * Constructor.
	 */
	public constructor({ canvasUuid, shardUuid, standalone, url }: ClientConnectionArgs) {
		// Process standalone
		if (standalone !== undefined) {
			this.standalone = standalone;
		}

		// Set socket
		if (standalone) {
			this.connection = Server.prototype
				.getInstance({ instanceUuid: shardUuid === undefined ? defaultInstanceUuid : shardUuid })
				.addConnection({ canvasUuid, connection: this, standalone });
		} else {
			this.connection = new WebSocket(url === undefined ? defaultServerUrl : url);
		}
	}
}
