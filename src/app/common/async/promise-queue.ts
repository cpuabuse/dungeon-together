/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Promise queue.
 *
 * @file
 */

import { CoreLog, LogLevel } from "../../core/error";

/**
 * Callback type.
 */
type SequenceQueueCallback = () => void;

/**
 * Enum incrementing variable.
 */
let state: number = 0;

/**
 * Promise queue state values.
 */
enum SequenceQueueState {
	/**
	 * No active or queued sequences.
	 */
	Ready = state++,

	/**
	 * Callback is running.
	 */
	Running = state++,

	/**
	 * Waiting to run next callback in sequence.
	 */
	Waiting = state++
}

/**
 * Sequence(promise) queue.
 *
 * @remarks
 * This is a queue for sequences - a chain of callbacks, scheduling more callbacks.
 * If a callback is added while a callback is running, it will be treated as part of sequence, and chained immediately.
 * But if a callback is added while a callback is waiting, it will be treated as a separate sequence, and added to the queue.
 */
export class SequenceQueue {
	private static timeout: number = 1000;

	/**
	 * Current promise.
	 */
	private promise: Promise<void> = Promise.resolve();

	/**
	 * Callbacks.
	 */
	private sequences: Array<SequenceQueueCallback | Promise<void>> = new Array<SequenceQueueCallback>();

	/**
	 * Current state.
	 */
	private state: SequenceQueueState = SequenceQueueState.Ready;

	/**
	 * Adds a promise to queue.
	 *
	 * @param param - Destructure parameter
	 */
	public addCallback({
		callback
	}: {
		/**
		 * Promise to add.
		 */
		callback: SequenceQueueCallback;
	}): void {
		if (this.state < SequenceQueueState.Waiting) {
			this.doAddCallback({ callback });
		} else {
			this.sequences.unshift(callback);
		}
	}

	/**
	 * Syncs next sequence to wait for a promise first.
	 *
	 * @param param - Destructure parameter
	 */
	public sync({
		promise
	}: {
		/**
		 * Promise to sync.
		 */
		promise: Promise<any>;
	}): void {
		this.sequences.unshift(promise);
	}

	/**
	 * Try to dequeue.
	 */
	private dequeue(): void {
		let callback: SequenceQueueCallback | Promise<void> | undefined = this.sequences.pop();
		if (callback) {
			if (callback instanceof Promise) {
				let promise: Promise<void> = new Promise(resolve => {
					const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
						CoreLog.global.log({
							error: new Error("Promise in synchronization timed out."),
							level: LogLevel.Alert
						});
					}, SequenceQueue.timeout);
					(callback as Promise<void>)
						.catch(error => {
							CoreLog.global.log({
								error: new Error("Promise in synchronization produced an error.", {
									cause: error instanceof Error ? error : undefined
								}),
								level: LogLevel.Alert
							});
						})
						.finally(() => {
							this.dequeue();
							resolve();
							clearTimeout(timeout);
						});
				});

				this.promise = promise;
			} else {
				this.doAddCallback({ callback });
			}

			this.state = SequenceQueueState.Waiting;
		} else {
			this.state = SequenceQueueState.Ready;
		}
	}

	/**
	 * Chains promise.
	 *
	 * @param param - Destructure parameter
	 */
	private doAddCallback({
		callback
	}: {
		/**
		 * Promise to add.
		 */
		callback: SequenceQueueCallback;
	}): void {
		// Not ready anymore
		if (this.state === SequenceQueueState.Ready) {
			this.state = SequenceQueueState.Waiting;
		}

		// Promise
		let promise: Promise<void> = new Promise(resolve => {
			// Will be called immediately, `this.promise` is old promise
			this.promise
				.catch(error => {
					CoreLog.global.log({
						error: new Error("Execution of promise in queue produced an error.", {
							cause: error instanceof Error ? error : undefined
						}),
						level: LogLevel.Alert
					});
				})
				// Finally used to prevent errors not firing next
				.finally(() => {
					// Set state and run callback
					this.state = SequenceQueueState.Running;
					callback();

					// If last added promise is the one being executed now
					if (this.promise === promise) {
						this.dequeue();
					} else {
						this.state = SequenceQueueState.Waiting;
					}

					// Resolve
					resolve();
				});
		});
		this.promise = promise;
	}
}
