/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Fog of war graphics.
 */

import { ColorMatrixFilter } from "pixi.js";
import { ObjectLikeGraphicsContainer } from "./graphics";

/**
 * Words used to describe FOW status.
 */
export enum FowWords {
	BlackEffect = "black-effect",
	Black = "black",
	Grey = "grey",
	White = "white"
}

/**
 * Container for levels in the grid with a child container for different FOW statuses.
 *
 * @example
 * ```
 * // Create a sprite container and add to a FOW container
 * let spriteContainer: Container = new Container();
 * let fowContainer: FowContainer = new FowContainer();
 * fowContainer.containers[FowWords.White].addChild(spriteContainer);
 * ```
 */
export class FowContainer extends ObjectLikeGraphicsContainer<FowWords> {
	/**
	 * Public constructor.
	 */
	public constructor() {
		super({
			values: new Set(Object.values(FowWords))
		});

		// Make black layer hidden
		this.containers[FowWords.Black].visible = false;

		// Burn grey
		const contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();
		contrastFilter.contrast(2, false);
		this.containers[FowWords.Grey].filters = [contrastFilter];
	}
}
