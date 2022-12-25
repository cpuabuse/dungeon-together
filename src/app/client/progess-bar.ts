/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file HP bar display.
 */

import Color from "color";
import { Container, Geometry, Mesh, Program, Shader } from "pixi.js";
import { Palette } from "../common/color";
import { ClientShard } from "./shard";

/**
 *  VertexSrc.
 */
const vertexSrc: string = `
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
`;

/**
 *  FragmentSrc.
 */
const fragmentSrc: string = `
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
`;

// Add dynamic size change
/**
 * Width.
 */
let width: number = 1.0;

/**
 * Max value.
 */
let maxValue: number = 37;

/**
 * Value.
 */
let value: number = 5;

/**
 * Height.
 */
const height: number = 0.15;

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
	 *Shader.
	 */
	public shader: Shader;

	/**
	 * Container.
	 */
	private container: Container;

	/**
	 *  Geometry for the progress bar.
	 */
	private static geometry: Geometry = ((): Geometry => {
		const geometry: Geometry = new Geometry().addAttribute(
			"coord",
			[0, 0, 0, height, 1, height, 1, 0].map(element => element * width),
			2
		);
		geometry.addIndex([0, 1, 2, 0, 2, 3]);
		return geometry;
	})();

	/**
	 *  Program.
	 *
	 * @param vertexSrc - The source of the vertex shader
	 * @param fragmentSrc - The source of the fragment shader
	 */
	private static program: Program = new Program(vertexSrc, fragmentSrc, `ProgressBarProgram`);

	/**
	 * Mesh.
	 */
	// private mesh: Mesh<Shader>;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		container,
		colors
	}: {
		/**
		 * Container.
		 */
		container: Container;

		/**
		 * Colors.
		 */
		colors?: HpBarColors;
	}) {
		this.container = container;
		this.colors = colors ?? neutralHpBarColors;

		// Add color on main bar
		let mainColor: Array<number> = this.colors.foregroundMain
			.rgb()
			.array()
			.map(element => element / 255);

		// Add color on secondary bar
		let secondaryColor: Array<number> = this.colors.background
			.rgb()
			.array()
			.map(element => element / 255);

		// Add color on border
		let borderColor: Array<number> = this.colors.border
			.rgb()
			.array()
			.map(element => element / 255);

		this.shader = new Shader(ProgressBar.program, {
			borderColor,
			borderRatio: 0.01,
			height,
			mainColor,
			maxValue,
			secondaryColor,
			secondaryColorIntensity: 10,
			value,
			width
		});

		const bar: Mesh<Shader> = new Mesh(ProgressBar.geometry, this.shader);
		bar.position.set(0, 0);
		bar.scale.set(50);
		this.container.addChild(bar);
	}
}
