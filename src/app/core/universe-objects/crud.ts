/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file CRUD operations for the universe objects
 */

import { CoreCellWord } from "../cell";
import { CoreEntityWord } from "../entity";
import { CoreGridWord } from "../grid";
import { CoreShardWord } from "../shard";
import { CoreUniverseObjectPath } from "./path";

/**
 * Names for the universe objects.
 */
export type CoreUniverseObjectWords = CoreShardWord | CoreGridWord | CoreCellWord | CoreEntityWord;

/**
 * CRUD concepts for universe objects.
 */
export type CoreUniverseObjectCrud<T extends CoreUniverseObjectWords> = {
	/**
	 * Add a new universe object.
	 */
	[K in T as `add${Capitalize<K>}`]: (arg: {
		/**
		 * Universe object to add.
		 */
		[A in K as Lowercase<A>]: unknown;
	}) => void;
} & {
	/**
	 * Get a universe object.
	 */
	[K in T as `get${Capitalize<K>}`]: (arg: CoreUniverseObjectPath) => unknown;
} & {
	/**
	 * Remove a universe object.
	 */
	[K in T as `remove${Capitalize<K>}`]: (arg: CoreUniverseObjectPath) => void;
};
