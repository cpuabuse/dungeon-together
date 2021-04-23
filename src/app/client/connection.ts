/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import * as typing from "io-ts";
import { MovementWord } from "../common/connection";
import { defaultServerUrl, defaultShardUuid } from "../common/defaults";
import { Uuid } from "../common/uuid";
import { ServerConnection } from "../server/connection";
import { ServerUniverse } from "../server/universe";

/**
 * Message type descriptions.
 *
 * To extract TypeScript types, we need to use `typeof`, which cannot be used on the values of the map, thus object is preferred.
 * Due to the fact that message type keys are created by developers, there will be no conflict with inherited properties.
 * Although, during processing of incoming messages, `messageTypeKeys` should be referenced to ensure the usage of own properties.
 *
 * Even though for union literals keyof is recommended in {@link https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals | io-ts documentation}, ignoring it to preserve meaning. {@link https://github.com/microsoft/TypeScript/issues/31268 | Pull request} should introduce enums instead.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const messageTypes = {
	movement: typing.type({
		direction: typing.union([
			typing.literal(MovementWord.Up),
			typing.literal(MovementWord.Down),
			typing.literal(MovementWord.Left),
			typing.literal(MovementWord.Right),
			typing.literal(MovementWord.ZUp),
			typing.literal(MovementWord.ZDown)
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
export type MovementMessage = typing.TypeOf<typeof messageTypes.movement>;

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
