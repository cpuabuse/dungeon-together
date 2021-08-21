/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Utilities for error handling
 */

import { SingleErrorArgs } from "../client/error";

/**
 * Convention for return type with error included.
 *
 * If `V` is undefined, then the value will not be explicitly set, hence `V extends undefined`, otherwise setting `undefined` explicitly for `value` is required.
 */
export type ErroringReturn<V = undefined> =
	| ({
			/**
			 * Error received.
			 */
			isErrored: true;
	  } & SingleErrorArgs)
	| (V extends undefined
			? {
					/**
					 * Result received.
					 */
					isErrored: false;
			  }
			: {
					/**
					 * Result received.
					 */
					isErrored: false;

					/**
					 * Return result.
					 */
					value: V;
			  });
