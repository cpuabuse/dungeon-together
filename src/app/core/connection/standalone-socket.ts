/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Virtual standalone socket.
 */

import { CoreEnvelope, CoreMessage, CoreSocket, processQueueWord } from ".";

/**
 * A class emulating Websocket for standalone connections.
 */
export class CoreStandaloneSocket<
	ReceiveMessage extends CoreMessage,
	SendMessage extends CoreMessage
> extends CoreSocket<ReceiveMessage, SendMessage> {
	/**
	 * A client-server corresponding socket.
	 */
	public target: CoreSocket<SendMessage, ReceiveMessage>;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback for superclass subscription
	 * @param target - The target to communicate with
	 */
	public constructor({
		target
	}: {
		/**
		 * Target socket.
		 */
		target?: CoreSocket<SendMessage, ReceiveMessage>;
	}) {
		super();
		// Assign target
		this.target = target ?? new CoreStandaloneSocket<SendMessage, ReceiveMessage>({ target: this });
	}

	/**
	 * Send an envelope.
	 *
	 * @param envelope - Envelope to send
	 */
	public async send({ messages }: CoreEnvelope<SendMessage>): Promise<void> {
		return new Promise((resolve, reject) => {
			/*
				From https://262.ecma-international.org/6.0/#sec-array.prototype.foreach it states:
				"forEach calls callbackfn once for each element present in the array, in ascending order"
			*/
			messages.forEach(message => {
				this.target.writeQueue(message);
			});

			this.target.connection?.tick({ word: processQueueWord }).then(resolve).catch(reject);
		});
	}
}
