/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { defaultServerUrl, defaultShardUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { Message } from "../comms/connection";
import { ServerConnection } from "../server/connection";
import { ServerUniverse } from "../server/universe";

/**
 * Arguments for [[ClientConnection]].
 */
export interface ClientConnectionArgs {
	/**
	 *
	 */
	canvasUuid: Uuid;
	/**
	 *
	 */
	shardUuid?: Uuid;
	/**
	 *
	 */
	standalone?: boolean;
	/**
	 *
	 */
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
			this.connection = ServerUniverse.prototype
				.getShard({ shardUuid: shardUuid === undefined ? defaultShardUuid : shardUuid })
				.addConnection({ canvasUuid, connection: this, standalone });
		} else {
			this.connection = new WebSocket(url === undefined ? defaultServerUrl : url);
		}
	}
}

/**
 * Message to pass about the character movements.
 *
 * Using type as it would be sent over the internet.
 */
export type MovementMessage = Message & {
	/**
	 * Direction that the character will move.
	 */
	direction: "up" | "down" | "right" | "left" | "zup" | "zdown";
};
