/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Websocket and emulation.
 *
 * Server WS and client Websocket classes to be added.
 */

import { vSocketProcessStackLimit } from "../../common/defaults/connection";
import { ErroringReturn } from "../../common/error";
import { CoreLog, LogLevel } from "../error";

/**
 * Type for callback function to sockets.
 *
 * To be used internally.
 */
export type CoreProcessCallback<C extends CoreScheduler> = (this: C) => Promise<boolean>;

/**
 * Converts a process callback to a process callback with `this` set to superclass.
 * This macro validates, that `this` of provided callback extends the subclass and subsequently a superclass.
 * Although, the callback itself might operate with `this` set to subclass.
 * Since it is to be used only from subclass, it can operate that way.
 * So, the process callback can be used with "this" type-safe super constructor/method.
 *
 * Produce `unknown` otherwise, so the result cannot be assigned.
 */
export type ToSuperclassCoreProcessCallback<
	F extends CoreProcessCallback<any>,
	C extends CoreScheduler
> = ThisParameterType<F> extends C ? CoreProcessCallback<C> : unknown;

/**
 * The process return type with set `this`.
 */
export type CoreProcessCallbackParameters<C extends CoreScheduler> = Parameters<CoreProcessCallback<C>>;

/**
 * Symbol to use for subscription.
 */
export const processQueueWord: symbol = Symbol("process-queue");

/**
 * Symbol to use for subscription.
 */
export const processInitWord: symbol = Symbol("queue-manager");

/**
 * Process for socket to process.
 *
 * Used in {@link CoreScheduler}, and ensures, that callback is invoked with appropriate `this`.
 */
interface CoreProcess {
	/**
	 * Number of times process was unsuccessfully executed in a tick-tock linear recursion.
	 *
	 * Execution should suspend if limit reached.
	 */
	stackLength: number;

	/**
	 * Callback for process.
	 */
	callback: CoreProcessCallback<CoreScheduler>;
}

/**
 * Args for tick-tock process of socket.
 */
interface CoreSchedulerTickTockArgs {
	/**
	 * Process symbol.
	 */
	word: symbol;
}

/**
 * Helper class for {@link VSocket} for logical separation.
 */
export class CoreScheduler {
	/**
	 * Corresponds for processing callbacks.
	 */
	private processes: Map<symbol, CoreProcess> = new Map();

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
		callback: CoreProcessCallback<CoreScheduler>;
	}) {
		// Subscribe to event
		this.addProcess({ callback, word: processQueueWord });
	}

	/**
	 * Adds the process to socket.
	 *
	 * @param param - Destructured param
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
		callback: CoreProcessCallback<CoreScheduler>;
	}): void {
		this.processes.set(word, { callback, stackLength: 0 });
	}

	/**
	 * To be invoked via event emitter.
	 *
	 * @param param - Destructured param
	 */
	public async tick({ word }: CoreSchedulerTickTockArgs): Promise<void> {
		let process: ErroringReturn<CoreProcess> = this.getProcess({ word });
		if (process.isErrored) {
			// Process undefined
			CoreLog.global.log({ level: LogLevel.Warning, ...process });
		} else if (process.value.stackLength === 0) {
			if ((await process.value.callback.call(this)) === false) {
				process.value.stackLength = 1;
				// Purpose of this call is to be delayed till next event cycle
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				this.tock({ word }).then(result => {
					if (result.isErrored) {
						// Tock error
						CoreLog.global.log({ level: LogLevel.Warning, ...result });
					}
				});
			}
		}
	}

	/**
	 * Wrapper to synchronously process.
	 *
	 * @param param - Destructured param
	 * @throws {@link TypeError}
	 * Throws, if the process does not exist.
	 *
	 * @returns Result of process
	 */
	protected getProcess({ word }: CoreSchedulerTickTockArgs): ErroringReturn<CoreProcess> {
		let process: CoreProcess | undefined = this.processes.get(word);
		if (typeof process === "undefined")
			return { error: new TypeError(`Process "${word.toString()}" does not exist`), isErrored: true };
		return { isErrored: false, value: process };
	}

	/**
	 * To be invoked as a function.
	 *
	 * @param param - Destructured param
	 * @throws {@link TypeError}
	 * Throws, if the process does not exist.
	 *
	 * @returns Error, if errored
	 */
	// Purpose of this method is to be delayed till next event cycle
	// eslint-disable-next-line @typescript-eslint/require-await
	private async tock({ word }: CoreSchedulerTickTockArgs): Promise<ErroringReturn> {
		// Get result of the process
		let process: CoreProcess | undefined = this.processes.get(word);

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
