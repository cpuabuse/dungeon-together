/*
File: src/shared/world/world.ts
cpuabuse.com
*/

/**
 * A game world.
 * It has nothing to do with resource organization. It is more like a dimension, that is shared between multiple grids.
 */

import { Default } from "../common/types";
import { DefaultKinds } from "../common/defaults";
import { Thing } from "./thing";

/**
 * An interface like thing kind, only requiring certain kinds to be there.
 */
export type ThingKinds = Default<
	DefaultKinds,
	{
		// Will be typechecked dynamicallly on each aceess.
		/**
		 * Information about kind.
		 */
		[key: string]: any;

		/**
		 * Literally, kind class.
		 */
		kind: typeof Thing;
	}
>;

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
	public thingKinds: ThingKinds;

	/**
	 * World constructor.
	 */
	public constructor(thingManifest: ThingManifest) {
		this.thingKinds = thingManifest.thingKinds;
	}
}
