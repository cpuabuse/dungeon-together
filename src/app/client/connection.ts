/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import { TypeOf, literal as literalType, type, union as unionType } from "io-ts";
import { defaultServerUrl, defaultShardUuid } from "../common/defaults";
import { downWord, leftWord, rightWord, upWord, zDownWord, zUpWord } from "../common/defaults/movement";
import { Uuid } from "../common/uuid";
import { ServerConnection } from "../server/connection";
import { ServerUniverse } from "../server/universe";

/**
 * Message type descriptions.
 *
 * To extract TypeScript types, we need to use `typeof`, which cannot be used on the values of the map, thus object is preferred.
 * Due to the fact that message type keys are created by developers, there will be no conflict with inherited properties.
 * Although, during processing of incoming messages, `messageTypeKeys` should be referenced to ensure the usage of own properties.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const messageTypes = {
	movement: type({
		direction: unionType([
			literalType(upWord),
			literalType(downWord),
			literalType(rightWord),
			literalType(leftWord),
			literalType(zUpWord),
			literalType(zDownWord)
		])
	})
};

/**
 * Keys used to identify message types.
 */
export type messageTypeKeys = keyof typeof messageTypes;

/**
 * Message to pass about the character movements.
 */
export type MovementMessage = TypeOf<typeof messageTypes.movement>;

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
