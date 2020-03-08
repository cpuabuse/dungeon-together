/*
File: src/shared/world/thing.ts
cpuabuse.com
*/

/**
 * A thing.
 */

import { Occupant, OccupantKind } from "../thing";
import { Renderable } from "../../render/renderable";

/**
 * A drawable thing occupying a cell.
 */
export abstract class Stackable extends Renderable implements Occupant, OccupantKind {
	/**
	 * Populates the cell with an array, if max is reached, swaps.
	 */
	public initialize(): void {
		// Initialize and populate exclusives from manifest
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

			// @ts-ignore: Variable is definitely assigned 2454
			this.exclusive.push({ name, occupants });
		});

		// Initialize stackables from manifest
		manifest.stackable.forEach(occupant => {
			this.stackable.push({ name: occupant, occupants: new Array() });
		});
	}}
