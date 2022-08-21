/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CoreLog, LogLevel } from "../../core/error";

/**
 * Promise queue.
 *
 * @file
 */

/**
 * Queued promise.
 */
export class PromiseQueue {
	private promise: Promise<void> = Promise.resolve();

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
		callback: () => void;
	}): void {
		this.promise = new Promise(resolve => {
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
				.then(() => {
					callback();
				})
				// Finally used to prevent errors not firing next
				.finally(() => {
					resolve();
				});
		});
	}
}
