/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Providing access to canvases.
 */

import { Client } from "./client";
import { Poolable } from "../shared/poolable";

/**
 * Class that knows about canvases.
 */
export class Clientable {}

/**
 * Overload poolable class.
 */
export interface Clientable extends Poolable {
	readonly pool: Client;
}
