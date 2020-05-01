/*
	File: src/app/render/screenable.ts
	cpuabuse.com
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
