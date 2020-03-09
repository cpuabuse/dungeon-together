/*
File: src/shared/world/thing.ts
cpuabuse.com
*/

/**
 * A thing.
 */

import { InitializeArgs, Thing, ThingArgs } from "../thing";

/**
 * A drawable thing occupying a cell.
 */
export abstract class Exclusive extends Thing {
	/**
	 * Exclusive constructor;
	 */
	public constructor({ cell, kind, world }: ThingArgs) {
		// Call superclass
		super({ cell, kind, world });
	}

	/**
	 * Populates the cell with an array, if max is reached, swaps.
	 */
	public static initialize({ cell, kind, world }: InitializeArgs): void {
		// Get max
		let max: number = 1;
		let nextMax: any = world.thingKinds[kind]?.max;
		if (typeof nextMax === "number") {
			if (nextMax >= 0) {
				max = nextMax;
			}
		}

		// Get min
		let min: number = max;
		let nextMin: any = world.thingKinds[kind]?.min;
		if (typeof nextMin === "number") {
			if (nextMax >= 0 && nextMax <= max) {
				max = nextMax;
			}
		}

		// Get current
		let current: number = cell.things.filter(function(thing) {
			return thing.kind === kind;
		}).length;

		// Provision minimum if needed
		if (current < min) {
			for (let i: number = 0; i < min; i++) {
				// The cell will properly register new thing
				// @ts-ignore:2511 This method is an example to be overriden by extending class
				new Exclusive({ cell, kind, world }); // eslint-disable-line no-new
			}
		}
	}
}
