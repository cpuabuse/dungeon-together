/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Definition of modes.
 */

import { Texture } from "pixi.js";

/**
 * Modes for the client.
 */
export interface Mode {
	textures: Array<Texture>;
}
