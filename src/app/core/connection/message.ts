/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Message type.
 *
 * @file
 */

import { DirectionWord, MessageTypeWord } from "../../common/defaults/connection";
import { Uuid } from "../../common/uuid";

/**
 * Message interface.
 */
interface CoreMessageBase {
	/**
	 * Message data.
	 */
	body: unknown;

	/**
	 * Type of the message.
	 */
	type: MessageTypeWord;
}

/**
 * Message interface.
 */
export interface CoreMessagePlayerBody {
	/**
	 * Player UUID.
	 */
	playerUuid: Uuid;
}

/**
 * Word used for movement.
 */
export type MovementWord = Exclude<DirectionWord, DirectionWord.Here>;

/**
 * Movement message interface.
 */
export interface CoreMessageMovement extends CoreMessageBase {
	/**
	 * Message data.
	 */
	body: CoreMessagePlayerBody & {
		/**
		 * Unit UUID to move.
		 */
		unitUuid: Uuid;
	} & (
			| {
					/**
					 * Movement direction.
					 */
					direction: MovementWord;

					/**
					 * Direction movement type.
					 */
					hasDirection: true;
			  }
			| {
					/**
					 * Target cell UUID.
					 */
					targetCellUuid: Uuid;

					/**
					 * Target movement type.
					 */
					hasDirection: false;
			  }
		);

	/**
	 * Type of the message.
	 */
	type: MessageTypeWord.Movement;
}

/**
 * Empty message interface.
 */
export interface CoreMessageEmpty extends CoreMessageBase {
	/**
	 * Message data.
	 */
	body: null;

	/**
	 * Type of the message.
	 */
	type: MessageTypeWord.Empty;
}

/**
 * Sync message interface.
 */
export interface CoreMessageSync extends CoreMessageBase {
	/**
	 * Message data.
	 */
	body: null;

	/**
	 * Type of the message.
	 */
	type: MessageTypeWord.Sync;
}

/**
 * Client-server command interface.
 */
export class CoreMessage implements CoreMessageBase {
	/**
	 * Message data.
	 */
	public body: CoreMessageBase["body"];

	/**
	 * Type of the message.
	 */
	public type: CoreMessageBase["type"];

	/**
	 * Constructor for message.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({ body, type }: CoreMessageBase) {
		// Initialize private properties
		this.body = body;
		this.type = type;
	}
}
