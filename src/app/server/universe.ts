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
import { Instance } from "../shared/interfaces";
import { Thing } from "./thing";
import { World } from "./world";

/**
 * Universe args.
 */
export interface UniverseArgs extends Instance {
	maps: Array<Grid>;
}

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
					return {
						occupants: cell.occupants.map(function(thing) {
							return { mode: thing.mode };
						}),
						x: grid.index[cell.id].x,
						y: grid.index[cell.id].y,
						z: grid.index[cell.id].z
					};
				})
			});
		});

		// Return
		return instance;
	}
}
