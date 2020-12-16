/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * The way you display things in screen.
 */

import { Matrix } from "pixi.js";

export interface View {
	/**
	 * Viewport matrix.
	 */
	matrix: Matrix;

	/**
	 * Scene height.
	 */
	sceneHeight: number;

	/**
	 * Scene width.
	 */
	sceneWidth: number;
}
