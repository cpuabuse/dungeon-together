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
 * Extending promise produces rejected promises, so a promise is contained instead.
 */
export class DeferredPromise<T = void> implements Pick<Promise<T>, "then" | "catch" | "finally"> {
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

	private promise: Promise<T> = new Promise((resolve, reject) => {
		// Setting methods not delayed, since `this` can be accessed, as class does not extend `Promise` anymore
		this.resolve = resolve;
		this.reject = reject;
	});

	/**
	 * `catch` method of a promise.
	 *
	 * @param onRejected - Promise on reject function
	 * @returns Promise
	 */
	public catch<TResult = never>(
		onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined
	): Promise<T | TResult> {
		return this.promise.catch(onRejected);
	}

	/**
	 * `finally` method of a promise.
	 *
	 * @param onFinally - Promise on finally function
	 * @returns Promise
	 */
	public finally(onFinally?: (() => void) | null | undefined): Promise<T> {
		return this.promise.finally(onFinally);
	}

	/**
	 * `then` method of a promise.
	 *
	 * @param onResolved - Promise on resolve function
	 * @param onRejected - Promise on reject function
	 * @returns Promise
	 */
	public then<TResult1 = T, TResult2 = never>(
		onResolved?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
	): Promise<TResult1 | TResult2> {
		return this.promise.then(onResolved, onRejected);
	}
}
