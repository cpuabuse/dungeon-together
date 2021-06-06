/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Client connection to server.
 */

import * as typing from "io-ts";
import { MessageTypeWord, MovementWord } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { VSocket } from "../common/vsocket";
import { CommsConnection, CommsConnectionArgs } from "../comms/connection";

/**
 * Message type descriptions.
 *
 * To extract TypeScript types, we need to use `typeof`, which cannot be used on the values of the map, thus object is preferred.
 * Due to the fact that message type keys are created by developers, there will be no conflict with inherited properties.
 * Although, during processing of incoming messages, `messageTypeKeys` should be referenced to ensure the usage of own properties.
 *
 * Even though for union literals keyof is recommended in {@link https://github.com/gcanti/io-ts/blob/master/index.md#union-of-string-literals | io-ts documentation}, ignoring it to preserve meaning. {@link https://github.com/microsoft/TypeScript/issues/31268 | Pull request} should introduce enums instead.
 *
 * As of now impossible to implement type predicates on class members.
 */
// Infer generic type
// eslint-disable-next-line @typescript-eslint/typedef
export const messageTypes = {
	[MessageTypeWord.Movement]: typing.type({
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
export type MovementMessage = typing.TypeOf<typeof messageTypes[MessageTypeWord.Movement]>;

/**
 * Client connection.
 */
export class ClientConnection implements CommsConnection {
	/**
	 * Client UUIDs.
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
