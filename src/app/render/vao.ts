/*
	File: src/app/render/vao.ts
	cpuabuse.com
*/

import { CommsMap } from "../comms/interfaces";
import { Screen } from "./screen";
import { Square } from "./square";

/**
 * Squares on screen.
 */

/**
 * Arguments of the VAO.
 */
export interface VaoArgs extends CommsMap {
	screen: Screen;
}

/**
 * Vector Array Object.
 */
export class Vao implements CommsMap {
	/**
	 * Locations.
	 */
	public locations: Array<Square> = new Array();

	/**
	 * Constructor.
	 */
	public constructor({ locations, screen }: VaoArgs) {
		locations.forEach(location => {
			this.locations.push(
				new Square({ occupants: location.occupants, screen, x: location.x, y: location.y, z: location.z })
			);
		});
	}
}
