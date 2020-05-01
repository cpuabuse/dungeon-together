/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Poolable, part of pool.
 */

import { Pool } from "./pool";

/**
 * For objects existing as part of [[Pool]].
 */
export interface Poolable {
	/**
	 * Actual pool.
	 */
	pool: Pool;
}
