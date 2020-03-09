/*
File: src/shared/world/world.ts
cpuabuse.com
*/

/**
 * A game world.
 */

import { Thing } from "./thing";

// TODO: Symbols will to be used as keys, but TS currently does not support it https://github.com/microsoft/TypeScript/issues/1863
/**
 * An interface like thing kind, only requiring certain kinds to be there.
 */
interface ThingKinds {
	/**
	 * Per kind entries.
	 */
	[key: string]: {
		// Will be typechecked dynamicallly on each aceess.
		/**
		 * Information about kind.
		 */
		[key: string]: any;

		/**
		 * Literally, kind class.
		 */
		kind: typeof Thing;
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
