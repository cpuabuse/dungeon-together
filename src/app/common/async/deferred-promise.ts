/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Deferred promise.
 */

import nextTick from "next-tick";

/**
 * Deferred promise.
 *
 * @remarks
 * This exposes ability to resolve/reject a promise multiple times, but it seems that it will not affect anything, so no guards introduced.
 */
export class DeferredPromise<T = void> extends Promise<T> {
	/**
	 * Promise reject.
	 */
	// Initialized immediately inside promise constructor
	public reject!: (reason?: any) => void;

	/**
	 * Promise resolve.
	 */
	// Initialized immediately inside promise constructor
	public resolve!: (value: T | PromiseLike<T>) => void;

	/**
	 * Constructor.
	 */
	public constructor() {
		super((resolve, reject) => {
			// If not immediate, `this` accessed by super
			nextTick(() => {
				this.resolve = resolve;
				this.reject = reject;
			});
		});
	}
}
