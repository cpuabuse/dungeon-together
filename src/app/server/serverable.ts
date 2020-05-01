/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Providing access to server resources.
 */

import { Poolable } from "../shared/poolable";
import { Server } from "./server";

/**
 * Class that knows about shards.
 */
export class Serverable {}

/**
 * Overload poolable class.
 */
export interface Serverable extends Poolable {
	readonly pool: Server;
}
