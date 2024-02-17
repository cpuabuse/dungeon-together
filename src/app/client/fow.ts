/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Fog of war graphics.
 */

import { ObjectLikeGraphicsContainer } from "./graphics";

/**
 * Words used to describe FOW status.
 */
export enum FowWords {
	White = "white",
	Grey = "grey",
	Black = "black"
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
	}
}
