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
	[K in T as `add${Capitalize<K>}`]: (...args: any[]) => void;
} & {
	/**
	 * Get a universe object.
	 */
	[K in T as `get${Capitalize<K>}`]: (...args: any[]) => unknown;
} & {
	/**
	 * Remove a universe object.
	 */
	[K in T as `remove${Capitalize<K>}`]: (...arg: any[]) => void;
};
