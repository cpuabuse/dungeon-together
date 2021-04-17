/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Definition of modes.
 */

import { Texture } from "pixi.js";

/**
 * Modes for the client.
 */
export interface Mode {
	/**
	 *
	 */
	textures: Array<Texture>;
}
