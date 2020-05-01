/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A game world.
 *
 * It has nothing to do with resource organization. It is more like a dimension, that is shared between multiple grids.
 */

import { Uuid } from "../common/uuid";

/**
 * A whole world.
 */
export interface World {
	/**
	 * Kinds of the things defining world "schema".
	 */
	kinds: Set<Uuid>;
}
