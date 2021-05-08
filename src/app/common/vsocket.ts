/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Websocket and emulation.
 *
 * Server WS and client Websocket classes to be added.
 */

import { EventEmitter } from "events";
import { Envelope } from "../comms/connection";
import { MessageTypeWord, vSocketMaxQueue } from "./defaults/connection";

/**
 * Symbol to use for subscription.
 */
const subscribeWord: symbol = Symbol("subscribe");

/**
 * Virtual socket abstraction.
 */
export abstract class VSocket {
	/**
	 * Event emitter.
	 */
	private emitter: EventEmitter = new EventEmitter();

	/**
	 * Queue to use for this socket.
	 */
	private queue: Array<Envelope> = new Array() as Array<Envelope>;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback to call on queue updates
	 */
	public constructor(callback?: () => void) {
		// Subscribe to event
		if (typeof callback !== "undefined") {
			this.emitter.addListener(subscribeWord, callback);
		}
	}

	/**
	 * Reads from the queue.
	 *
	 * @returns Envelope
	 */
	public readQueue(): Envelope {
		// Pop
		let envelope: Envelope | undefined = this.queue.pop();

		// Return if array empty
		if (typeof envelope === "undefined") {
			return new Envelope({ message: null, type: MessageTypeWord.Empty });
		}

		// Return if we could pop
		return envelope;
	}

	/**
	 * Send an envelope.
	 */
	public abstract send(envelope: Envelope): void;

	/**
	 * Adds to the queue.
	 *
	 * @param envelope - Envelope to add
	 */
	protected writeQueue(envelope: Envelope): void {
		if (this.queue.length < vSocketMaxQueue) {
			this.queue.push(envelope);
		}

		// Notify
		this.emitter.emit(subscribeWord);
	}
}

/**
 * A class emulating Websocket for standalone connections.
 */
export class VStandaloneSocket extends VSocket {
	/**
	 * A client-server corresponding socket.
	 */
	public target: VStandaloneSocket;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback for superclass subscription
	 * @param target - The target to communicate with
	 */
	public constructor({
		callback,
		secondary
	}: {
		/**
		 * Callback to call in superclass.
		 */
		callback: () => void;
		/**
		 * Secondary argument.
		 */
		secondary: VStandaloneSocket | (() => void);
	}) {
		// Call super
		super(callback);

		// Assign target
		this.target =
			secondary instanceof VStandaloneSocket
				? secondary
				: new VStandaloneSocket({ callback: secondary, secondary: this });
	}

	/**
	 * Send an envelope.
	 *
	 * @param envelope - Envelope to send
	 */
	public send(envelope: Envelope): void {
		this.target.writeQueue(envelope);
	}
}
