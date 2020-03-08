/*
File: src/shared/world/thing.ts
cpuabuse.com
*/

/**
 * A thing.
 */

import { Cell } from "../cell";
import { Thing, ThingArgs } from "../thing";
import { Renderable } from "../../render/renderable";

/**
 * A drawable thing occupying a cell.
 */
export abstract class Exclusive extends Thing {
	/**
	 * Maximum number of exclusives in a cell.
	 */
	public static max: number = 1;

	/**
	 * Exclusive constructor;
	 */
	public constructor({ cell, world }: ThingArgs, max: number) {
		// Call superclass
		super({ cell, world });

	}
	
	/**
	 * Populates the cell with an array, if max is reached, swaps.
	 */
	public static initialize(cell: Cell): void {
		// Ensure there is extra space
		
		
		// If occupant was found in interface
		let occupantsNotSet: boolean = true;

		// Occupants to push to this class
		let occupants: Array<Exclusive>;

		// Search for argument entry
		if (identifiedOccupants.exclusive !== undefined) {
			let identifiedOccupant: IdentifiedExclusive | undefined = identifiedOccupants.exclusive.find(function(
				IdentifiedOccupantElement
			) {
				return IdentifiedOccupantElement.name === name;
			});

			if (identifiedOccupant !== undefined) {
				occupants = identifiedOccupant.occupants;
				occupantsNotSet = false;
			}
		}

		// Set the occupants to default
		if (occupantsNotSet) {
			occupants = new Array(new None(this));
		}

		// @ts-ignore:2454 Variable is definitely assigned
		this.exclusive.push({ name, occupants });
	});
}
