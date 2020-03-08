/*
File: src/shared/world/world.ts
cpuabuse.com
*/

/**
 * A game world.
 */

import { Thing } from "./thing";

/**
 * An interface like thing kind, only requiring certain kinds to be there.
 */
interface ThingKinds {
	kind: {
		[key: string]: typeof Thing;
	};
}

/**
 * Manifest defining occupnats kinds in the cell.
 * Always has none kind.
 */
export interface ThingManifest {
	/**
	 * Kinds, an array.
	 */
	thingKinds: ThingKinds;
}

/**
 * A whole world.
 */
export class World implements ThingManifest {
	/**
	 * Kinds of the things defining world "schema".
	 */
	thingKinds: ThingKinds;

	/**
	 * World constructor.
	 */
	constructor(thingManifest: ThingManifest) {
		this.thingKinds = thingManifest.thingKinds;
	}
}
