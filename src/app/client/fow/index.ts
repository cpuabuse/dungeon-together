/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Fog of war graphics.
 */

import { ColorMatrixFilter, Filter, Graphics, Ticker } from "pixi.js";
import { whiteBin } from "../../common/color";
import { ObjectLikeGraphicsContainer } from "../graphics";
import fragmentSrc from "./fragment.glsl";

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
 * Uniform type interface.
 */
export type FowShaderUniforms = {
	/**
	 * Uniforms.
	 */
	time: number;
};

/**
 * FOW uniforms.
 */
const fowFilterUniforms: FowShaderUniforms = {
	time: 0
};

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
	public static readonly blackEffectFilter: Filter = new Filter(undefined, fragmentSrc, fowFilterUniforms);

	public static readonly contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();

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
		this.containers[FowWords.Grey].filters = [FowContainer.contrastFilter];

		// Set a black effect
		this.containers[FowWords.BlackEffect].filters = [FowContainer.blackEffectFilter];

		// Set shader area
		// TODO:Find a way to add a full screen object to be used as a dummy for a shader
		const graphics: Graphics = new Graphics();
		graphics.beginFill(whiteBin);
		graphics.drawRect(0, 0, 2000, 2000);
		graphics.endFill();
		this.containers[FowWords.BlackEffect].addChild(graphics);
	}
}

// Initialize contrast filter
FowContainer.contrastFilter.contrast(2, false);

/**
 * Pass a time uniform through Pixi ticker to able motion to our FOW.
 */
const ticker: Ticker = Ticker.shared;
ticker.add(time => {
	FowContainer.blackEffectFilter.uniforms.time += time;
});
