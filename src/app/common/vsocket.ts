/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Websocket and emulation.
 *
 * Server WS and client Websocket classes to be added.
 */

import { LogLevel, processLog } from "../client/error";
import { Envelope, Message } from "../comms/connection";
import { CoreUniverse } from "../comms/universe";
import { MessageTypeWord, vSocketMaxQueue, vSocketProcessStackLimit } from "./defaults/connection";
import { ErroringReturn } from "./error";

/**
 * Type for callback function to sockets.
 *
 * To be used internally.
 */
export type ProcessCallback<C extends SocketProcessBase> = (this: C) => Promise<boolean>;

/**
 * Converts a process callback to a process callback with `this` set to superclass.
 * This macro validates, that `this` of provided callback extends the subclass and subsequently a superclass.
 * Although, the callback itself might operate with `this` set to subclass.
 * Since it is to be used only from subclass, it can operate that way.
 * So, the process callback can be used with "this" type-safe super constructor/method.
 */
export type ToSuperclassProcessCallback<
	F extends ProcessCallback<any>,
	C extends SocketProcessBase
> = ThisParameterType<F> extends C ? ProcessCallback<C> : unknown;

/**
 * The process return type with set `this`.
 */
export type ProcessCallbackParameters<C extends SocketProcessBase> = Parameters<ProcessCallback<C>>;

/**
 * Symbol to use for subscription.
 */
const processQueueWord: symbol = Symbol("process-queue");

/**
 * Symbol to use for subscription.
 */
export const processInitWord: symbol = Symbol("queue-manager");

/**
 * Process for socket to process.
 *
 * Used in {@link SocketProcessBase}, and ensures, that callback is invoked with appropriate `this`.
 */
interface SocketProcessBaseProcess {
	/**
	 * Number of times process was unsuccessfully executed in a tick-tock linear recursion.
	 *
	 * Execution should suspend if limit reached.
	 */
	stackLength: number;

	/**
	 * Callback for process.
	 */
	callback: ProcessCallback<SocketProcessBase>;
}

/**
 * Args for tick-tock process of socket.
 */
interface SocketProcessBaseTickTockArgs {
	/**
	 * Process symbol.
	 */
	word: symbol;
}

/**
 * Arguments for single socket.
 */
interface VStandaloneSocketSingleArgs<C extends CoreUniverse, CP extends CoreUniverse, CS extends CoreUniverse> {
	/**
	 * Callback to call in superclass.
	 */
	callback: ProcessCallback<VStandaloneSocket<CP, CS>>;

	/**
	 * Resync function.
	 */
	sync: VSocket<C>["sync"];

	/**
	 * Universe to initialize socket with.
	 */
	universe: C;
}

/**
 * Combined arguments for the socket constructor.
 */
interface VStandaloneSocketArgs<CP extends CoreUniverse, CS extends CoreUniverse> {
	/**
	 * Arguments for this socket.
	 */
	primary: VStandaloneSocketSingleArgs<CP, CP, CS>;

	/**
	 * Secondary argument.
	 */
	secondary: VStandaloneSocket<CS, CP> | VStandaloneSocketSingleArgs<CS, CS, CP>;
}

/**
 * Helper class for {@link VSocket} for logical separation.
 */
export class SocketProcessBase {
	/**
	 * Corresponds for processing callbacks.
	 */
	private processes: Map<symbol, SocketProcessBaseProcess> = new Map();

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback to call on queue updates
	 */
	public constructor({
		callback
	}: {
		/**
		 * Optional callback.
		 */
		callback: ProcessCallback<SocketProcessBase>;
	}) {
		// Subscribe to event
		if (typeof callback !== "undefined") {
			this.addProcess({ callback, word: processQueueWord });
		}
	}

	/**
	 * Adds the process to socket.
	 */
	public addProcess({
		word,
		callback
	}: {
		/**
		 * Subscription word.
		 */
		word: symbol;

		/**
		 * Subscription callback.
		 */
		callback: ProcessCallback<SocketProcessBase>;
	}): void {
		this.processes.set(word, { callback, stackLength: 0 });
	}

	/**
	 * To be invoked via event emitter.
	 */
	public async tick({ word }: SocketProcessBaseTickTockArgs): Promise<void> {
		let process: ErroringReturn<SocketProcessBaseProcess> = this.getProcess({ word });
		if (process.isErrored) {
			// Process undefined
			processLog({ level: LogLevel.Warning, ...process });
		} else if (process.value.stackLength === 0) {
			if ((await process.value.callback.call(this)) === false) {
				process.value.stackLength = 1;
				// Purpose of this call is to be delayed till next event cycle
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				this.tock({ word }).then(result => {
					if (result.isErrored) {
						// Tock error
						processLog({ level: LogLevel.Warning, ...result });
					}
				});
			}
		}
	}

	/**
	 * Wrapper to synchronously process.
	 *
	 * @throws {@link TypeError}
	 * Throws, if the process does not exist.
	 *
	 * @returns Result of process
	 */
	protected getProcess({ word }: SocketProcessBaseTickTockArgs): ErroringReturn<SocketProcessBaseProcess> {
		let process: SocketProcessBaseProcess | undefined = this.processes.get(word);
		if (typeof process === "undefined")
			return { error: new TypeError(`Process "${word.toString()}" does not exist`), isErrored: true };
		return { isErrored: false, value: process };
	}

	/**
	 * To be invoked as a function.
	 *
	 * @throws {@link TypeError}
	 * Throws, if the process does not exist.
	 *
	 * @returns Error, if errored
	 */
	// Purpose of this method is to be delayed till next event cycle
	// eslint-disable-next-line @typescript-eslint/require-await
	private async tock({ word }: SocketProcessBaseTickTockArgs): Promise<ErroringReturn> {
		// Get result of the process
		let process: SocketProcessBaseProcess | undefined = this.processes.get(word);

		// Process, if process not found
		if (typeof process === "undefined")
			return { error: new TypeError(`Process "${word.toString()}" does not exist`), isErrored: true };

		// Process stack overflow
		if (process.stackLength < vSocketProcessStackLimit) {
			if (await process.callback.call(this)) {
				process.stackLength = 0;

				// Return success
				return { isErrored: false };
			}
			process.stackLength++;

			// Will rethrow
			return this.tock({ word });
		}
		// Reset stack count
		process.stackLength = 0;

		// Throw that maximum stack is reached
		return {
			error: new Error(
				`Process "${word.toString()}" stopped execution due to stack overflow; amount of times process was executed recursively: ${
					process.stackLength
				}; process stack limit: ${vSocketProcessStackLimit}`
			),
			isErrored: true
		};
	}
}

/**
 * Virtual socket abstraction.
 *
 * Emitter dispatches `tick()`; `tick()` performs processing, if `tock()` is not queued, otherwise `tick()` calls `tock()` asynchronously; `tock()` will requeue itself, if the process is not finished, while counting stack depth.
 */
export abstract class VSocket<C extends CoreUniverse> extends SocketProcessBase {
	/**
	 * Universe socket.
	 */
	public universe: C;

	/**
	 * Queue to use for this socket.
	 */
	private queue: Array<Message> = new Array() as Array<Message>;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback to call on queue updates
	 */
	public constructor({
		callback,
		universe
	}: {
		/**
		 * Optional callback.
		 */
		callback: ProcessCallback<VSocket<C>>;

		/**
		 * Universe to initialize socket with.
		 */
		universe: C;
	}) {
		super({ callback: callback as ToSuperclassProcessCallback<typeof callback, SocketProcessBase> });
		this.universe = universe;
	}

	/**
	 * Reads from the queue.
	 *
	 * @returns Message
	 */
	public readQueue(): Message {
		// Pop
		let message: Message | undefined = this.queue.shift();

		// Return if array empty
		if (typeof message === "undefined") {
			return new Message({ body: null, type: MessageTypeWord.Empty });
		}

		// Return if we could pop
		return message;
	}

	/**
	 * Send an envelope.
	 */
	public abstract send({
		envelope
	}: {
		/**
		 * Envelope to send.
		 */
		envelope: Envelope;
	}): Promise<void>;

	/**
	 * Starts/signals for resynchronization.
	 */
	protected abstract sync(): void;

	/**
	 * Adds to the queue.
	 *
	 * @param message - Message to add
	 */
	protected writeQueue(message: Message): void {
		if (this.queue.length < vSocketMaxQueue) {
			this.queue.push(message);
		} else {
			processLog({ error: new Error("Queue limit reached"), level: LogLevel.Warning });
			this.sync();
		}
	}
}

/**
 * A class emulating Websocket for standalone connections.
 */
export class VStandaloneSocket<CP extends CoreUniverse, CS extends CoreUniverse = CoreUniverse> extends VSocket<CP> {
	/**
	 * A client-server corresponding socket.
	 */
	public target: VStandaloneSocket<CS, CP>;

	/**
	 * Function to resync if failure occurs.
	 */
	protected sync: () => void;

	/**
	 * Public constructor.
	 *
	 * @param callback - Callback for superclass subscription
	 * @param target - The target to communicate with
	 */
	public constructor({ primary, secondary }: VStandaloneSocketArgs<CP, CS>) {
		// Call super
		super({
			callback: primary.callback as ToSuperclassProcessCallback<typeof primary.callback, VSocket<CP>>,
			universe: primary.universe
		});

		// Set sync
		this.sync = primary.sync;

		// Assign target
		this.target =
			secondary instanceof VStandaloneSocket
				? secondary
				: new VStandaloneSocket<CS, CP>({ primary: secondary, secondary: this });
	}

	/**
	 * Send an envelope.
	 *
	 * @param envelope - Envelope to send
	 */
	public async send({
		envelope
	}: {
		/**
		 * Envelope to send.
		 */
		envelope: Envelope;
	}): Promise<void> {
		/*
			From https://262.ecma-international.org/6.0/#sec-array.prototype.foreach it states:
			"forEach calls callbackfn once for each element present in the array, in ascending order"
		*/
		envelope.messages.forEach(message => {
			this.target.writeQueue(message);
		});

		await this.target.tick({ word: processQueueWord });
	}
}
