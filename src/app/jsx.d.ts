/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 *
 * JSX declarations.
 */

declare namespace JSX {
	/**
	 * Prepare type for merging.
	 */
	type IntrinsicElementMap = {
		[K in keyof HTMLElementTagNameMap]: any;
	};

	/**
	 * Merge intrinsic elements with HTML tags, for TS strict mode.
	 */
	interface IntrinsicElements extends IntrinsicElementMap {}
}
