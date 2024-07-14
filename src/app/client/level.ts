/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Level container.
 */

import { ColorMatrixFilter } from "pixi.js";
import { ObjectLikeGraphicsContainer } from "./graphics";

/**
 * Words used to describe level status.
 */
export enum LevelWords {
	Black = "black",
	Grey = "grey",
	White = "white"
}

/**
 * Container for levels in the grid with a child container for different display  statuses.
 *
 * @example
 * ```
 * // Add to a level container
 * let spriteContainer: Container = new Container();
 * let levelContainer: LevelContainer = new LevelContainer();
 * levelContainer.containers[LevelWords.White].addChild(spriteContainer);
 * ```
 */
export class LevelContainer extends ObjectLikeGraphicsContainer<LevelWords> {
	/**
	 * Contrast filter for grade out effect.
	 */
	public static readonly contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();

	/**
	 * Public constructor.
	 */
	public constructor() {
		super({
			values: new Set(Object.values(LevelWords))
		});

		// Make black layer hidden
		this.containers[LevelWords.Black].visible = false;

		// Burn grey
		this.containers[LevelWords.Grey].filters = [LevelContainer.contrastFilter];
	}
}

// Initialize contrast filter
LevelContainer.contrastFilter.contrast(2, false);
