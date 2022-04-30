/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Additional parameters, not related to input data.
 */

import { DeferredPromise } from "../../common/async";

/**
 * Secondary parameters for constructor.
 */
export type CoreUniverseObjectInitializationParameter = {
	/**
	 * Creation happened.
	 *
	 * @remarks
	 * For non container universe objects (entity) it does not matter where in constructor resolve happens, nor does it have to be delayed, as then-ables including async functions will be executed in the next loop.
	 */
	created: DeferredPromise<void>;

	/**
	 * Hook to initialize.
	 *
	 * @remarks
	 * Normal promise, as we can pass the promise itself to the constructor, by letting it finish first, wrapping usage into `setTimeout`.
	 */
	attachHook: Promise<void>;
};
