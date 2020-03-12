/*
	File: src/shared/world/universe.ts
	cpuabuse.com
*/

/**
 * A universe with everything.
 */

import { DefaultWorlds, defaultKind, defaultWorld } from "../common/defaults";
import { Default } from "../common/types";
import { Grid } from "./grid";
import { Instance } from "../comms/interfaces";
import { Thing } from "./thing";
import { World } from "./world";

/**
 * A whole universe.
 */
export class Universe implements Instance {
	/**
	 * Grids of the universe.
	 */
	public maps: Array<Grid> = new Array();

	/**
	 * Worlds for the universe.
	 * Readonly keys since we cannot remove the world, with possible dependents.
	 */
	public worlds: Default<DefaultWorlds, World> = {
		[defaultWorld]: new World({ thingKinds: { [defaultKind]: { kind: Thing } } })
	};

	/**
	 * Gets the state for synchronization.
	 */
	public getInstance(): Instance {
		let instance: Instance = {
			maps: new Array()
		};

		this.maps.forEach(function(grid: Grid) {
			instance.maps.push({
				locations: grid.locations.map(function(cell) {
					let [x, y, z]: [number, number, number] = cell.coordinates;
					return {
						occupants: cell.occupants.map(function(thing) {
							return { mode: thing.mode };
						}),
						x,
						y,
						z
					};
				})
			});
		});

		// Return
		return instance;
	}
}
