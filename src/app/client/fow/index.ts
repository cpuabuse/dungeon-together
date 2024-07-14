/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Container, Filter, Graphics, Ticker } from "pixi.js";
import { whiteBin } from "../../common/color";
import fragmentSrc from "./fragment.glsl";

/**
 * @file
 * Fog of war effect.
 */

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
 * Container for FOW in the grid with a child container for different FOW statuses.
 *
 * @example
 * ```
 * // Add FOW to root
 * let rootContainer: Container = new Container();
 * let fowContainer: FowContainer = new FowContainer();
 * rootContainer.addChild(fowContainer.container);
 * ```
 */
export class FowContainer {
	/**
	 * Pixi container for FOW.
	 */
	public container: Container = new Container();

	/**
	 * FOW effect filter.
	 */
	public static readonly fowEffectFilter: Filter = new Filter(undefined, fragmentSrc, fowFilterUniforms);

	/**
	 * Public constructor.
	 */
	public constructor() {
		// Set a fow effect
		this.container.filters = [FowContainer.fowEffectFilter];

		// Set shader area
		// TODO:Find a way to add a full screen object to be used as a dummy for a shader
		const graphics: Graphics = new Graphics();
		graphics.beginFill(whiteBin);
		graphics.drawRect(0, 0, 2000, 2000);
		graphics.endFill();
		this.container.addChild(graphics);
	}
}

/**
 * Pass a time uniform through Pixi ticker to able motion to our FOW.
 *
 * @remarks
 * Even though ideally shards' respective tickers should be used, since we are sharing static shader, for performance purposes we will use
 * a shared ticker.
 */
const ticker: Ticker = Ticker.shared;
ticker.add(time => {
	FowContainer.fowEffectFilter.uniforms.time += time;
});
