/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * @file Core args
 */

/**
 * Core universe object container args.
 */
export type CoreUniverseObjectContainerArgs<T extends CoreUniverseObjectIds> = {
	/**
	 * Child universe objects.
	 */
	[K in keyof CoreUniverseObjectWords[T]["singularLowercaseWord"]]: unknown;
};
