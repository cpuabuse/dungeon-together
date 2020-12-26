/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * An exclusive entity.
 */

import { InitializeArgs, ServerEntity, ServerEntityArgs } from "../entity";

/**
 * A drawable thing occupying a cell.
 */
export abstract class Exclusive extends ServerEntity {
	/**
	 * Exclusive constructor;
	 */
	public constructor({ kind, parent, world }: ServerEntityArgs) {
		// Call superclass
		super({ kind, parent, world });
	}

	/**
	 * Populates the cell with an array, if max is reached, swaps.
	 */
	public static initialize({ cell, kind, world }: InitializeArgs): void {
		// Get max
		let max: number = 1;
		let nextMax: any = cell.universe.worlds[world].thingKinds[kind]?.max;
		if (typeof nextMax === "number") {
			if (nextMax >= 0) {
				max = nextMax;
			}
		}

		// Get min
		let min: number = max;
		let nextMin: any = cell.universe.worlds[world].thingKinds[kind]?.min;
		if (typeof nextMin === "number") {
			if (nextMax >= 0 && nextMax <= max) {
				max = nextMax;
			}
		}

		// Get current
		let current: number = cell.occupants.filter(function (thing) {
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
