/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Fog of war graphics.
 */

import { ColorMatrixFilter, Filter, Graphics, Ticker } from "pixi.js";
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
	public static readonly blackEffectFilter: Filter = new Filter(undefined, fragmentSrc, {
		// Time in milliseconds since the shader started
		time: 0.5
	});

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

		this.containers[FowWords.BlackEffect].filters = [FowContainer.blackEffectFilter];

		// TODO:Find a way to add a full screen object to be used as a dummy for a shader
		const graphics: Graphics = new Graphics();
		graphics.beginFill(0xffffff);
		graphics.drawRect(0, 0, 2000, 2000);
		graphics.endFill();
		this.containers[FowWords.BlackEffect].addChild(graphics);

		FowContainer.blackEffectFilter.uniforms.time = 0;
	}
}
FowContainer.contrastFilter.contrast(2, false);
/**
 * Pass a time uniform through Pixi ticker to able motion to our FOW.
 */
const ticker: Ticker = Ticker.shared;
ticker.add(time => {
	FowContainer.blackEffectFilter.uniforms.time += time;
});
