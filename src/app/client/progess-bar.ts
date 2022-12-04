/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file HP bar display.
 */

import Color from "color";
import { Geometry, Shader } from "pixi.js";
import { Palette } from "../common/color";
import { ClientShard } from "./shard";

/**
 * HP bar parts tuple.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const hpBarColorWords = ["background", "foregroundMain", "foregroundSecondary", "border", "accent"] as const;

/**
 * Type representing colors in an HP bar.
 */
export type HpBarColors = Palette<typeof hpBarColorWords>;

/**
 * Friendly HP bar colors.
 */
export const friendlyHpBarColors: HpBarColors = {
	accent: new Color("#8de805"),
	background: new Color("#003d0a"),
	border: new Color("#191a23"),
	foregroundMain: new Color("#36e30b"),
	foregroundSecondary: new Color("#014c01")
};

/**
 * Neutral HP bar colors.
 */
export const neutralHpBarColors: HpBarColors = {
	accent: new Color("#051de8"),
	background: new Color("#1f003d"),
	border: new Color("#0c031a"),
	foregroundMain: new Color("#360be3"),
	foregroundSecondary: new Color("#1c014c")
};

/**
 * Enemy HP bar colors.
 */
export const enemyHpBarColors: HpBarColors = {
	accent: new Color("#e80c05"),
	background: new Color("#3d1600"),
	border: new Color("#1a1c03"),
	foregroundMain: new Color("#e3360b"),
	foregroundSecondary: new Color("#4d1601")
};

/**
 * Progress bar class.
 */
export class ProgressBar {
	/**
	 *  Hp bar colors.
	 */
	public colors: HpBarColors;

	/**
	 *  Geometry for the progress bar.
	 */
	private static geometry: Geometry;

	/**
	 * Mesh.
	 */
	// private mesh: Mesh<Shader>;

	/**
	 * Shader.
	 */
	private static shader: Shader = Shader.from(
		`
precision mediump float;
attribute vec2 coord;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
uniform float width;
varying float relativeWidth;
varying float relativeHeight;

void main() {
	relativeWidth = coord.x / width;
	relativeHeight = coord.y / width;
	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(coord, 1.0)).xyz, 1.0);
}
`,
		`
precision mediump float;
varying float relativeWidth;
varying float relativeHeight;
uniform vec3 secondaryColor;
uniform vec3 mainColor;
uniform vec3 borderColor;
uniform float secondaryColorIntensity;
uniform float maxValue;
uniform float value;
uniform float borderRatio;
uniform float height;

void main() {
	float ratio = value / maxValue;

	if (relativeWidth >= borderRatio && (relativeWidth <= 1.0 - borderRatio) && relativeHeight >= borderRatio && (relativeHeight <= height - borderRatio)) {
		if (relativeWidth <= ratio) {
			gl_FragColor = vec4(mainColor + (secondaryColor - mainColor) * exp((relativeWidth / ratio - 1.0) * secondaryColorIntensity) * relativeWidth / ratio, 1.0);
		} else {
			gl_FragColor = vec4(secondaryColor, 1.0);
		}
	} else {
		gl_FragColor = vec4(borderColor, 1.0);
	}
}
`,
		{}
	);

	/**
	 * Client shard.
	 */
	private shard: ClientShard;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		shard,
		colors
	}: {
		/**
		 * Client shard.
		 */
		shard: ClientShard;

		/**
		 * Colors.
		 */
		colors?: HpBarColors;
	}) {
		this.shard = shard;
		this.colors = colors ?? neutralHpBarColors;
	}
}
