import { Manifest } from "./cell";

/*
	File: src/shared/world/world.ts
	cpuabuse.com
*/

/**
 * A game world.
 */

/**
 * A whole world.
 */
export class World {
	manifest: Manifest;

	/**
	 * World constructor.
	 */
	constructor(manifest: Manifest) {
		this.manifest = manifest;
	}
}
