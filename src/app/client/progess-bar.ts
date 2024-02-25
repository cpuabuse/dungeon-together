/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file HP bar display.
 */

import Color from "color";
import { Container, Geometry, Mesh, Program, Shader } from "pixi.js";
import { Palette } from "../common/color";

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
uniform vec3 accentColor;
uniform float accentColorIntensity;
uniform float maxValue;
uniform float value;
uniform float borderRatio;
uniform float height;

void main() {
	float ratio = value / maxValue;

	if (relativeWidth >= borderRatio && (relativeWidth <= 1.0 - borderRatio) && relativeHeight >= borderRatio && (relativeHeight <= height - borderRatio)) {
		if (relativeWidth <= ratio) {
			gl_FragColor = vec4(mainColor + (accentColor - mainColor) * exp((relativeWidth / ratio - 1.0) * accentColorIntensity), 1.0);
		} else {
			gl_FragColor = vec4(secondaryColor, 1.0);
		}
	} else {
		gl_FragColor = vec4(borderColor, 1.0);
	}
}
`;

/**
 * RGB integer scale factor.
 */
const rgbIntegerScaleFactor: number = 255;

/**
 * Width.
 */
const width: number = 1;

/**
 * Height.
 */
const height: number = 0.15;

/**
 * Default max value.
 */
const defaultMaxValue: number = 100;

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
	 * Mesh.
	 */
	public mesh: Mesh<Shader>;

	/**
	 *Shader.
	 */
	public shader: Shader;

	/**
	 * Scale getter.
	 *
	 * @returns Scale factor
	 */
	public get scale(): number {
		return this.mesh.scale.x;
	}

	/**
	 * Scale setter.
	 */
	public set scale(scale: number) {
		// TODO: Add aspect ratio member to class.
		this.mesh.scale.set(scale);
	}

	/**
	 * Max value getter.
	 *
	 * @returns Uniform value
	 */
	public get maxValue(): number {
		// Data is received from video card
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		let {
			maxValue
		}: {
			/**
			 * Bar value.
			 */
			maxValue?: any;
		} = this.shader.uniforms;

		return typeof maxValue === "number" ? maxValue : 0;
	}

	/**
	 * Max value setter.
	 */
	public set maxValue(maxValue: number) {
		this.shader.uniforms.maxValue = maxValue;
	}

	/**
	 * Value getter.
	 *
	 * @returns Uniform value
	 */
	public get value(): number {
		// Data is received from video card
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		let {
			value
		}: {
			/**
			 * Bar value.
			 */
			value?: any;
		} = this.shader.uniforms;

		return typeof value === "number" ? value : 0;
	}

	/**
	 * Value setter.
	 */
	public set value(value: number) {
		this.shader.uniforms.value = value;
	}

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
			// Two values per vertex
			// eslint-disable-next-line no-magic-numbers
			2
		);
		// Index mapping
		// eslint-disable-next-line no-magic-numbers
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
		colors = neutralHpBarColors,
		maxValue = defaultMaxValue,
		value = 0,
		scale = 1
	}: {
		/**
		 * Container.
		 */
		container: Container;

		/**
		 * Colors.
		 */
		colors?: HpBarColors;

		/**
		 * Max value.
		 */
		maxValue?: number;

		/**
		 * Value.
		 */
		value?: number;

		/**
		 * Scale.
		 */
		scale?: number;
	}) {
		this.container = container;
		this.colors = colors;

		// Add color on main bar
		let mainColor: Array<number> = this.colors.foregroundMain
			.rgb()
			.array()
			.map(element => element / rgbIntegerScaleFactor);

		// Add color on secondary bar
		let secondaryColor: Array<number> = this.colors.background
			.rgb()
			.array()
			.map(element => element / rgbIntegerScaleFactor);

		// Add color on border
		let borderColor: Array<number> = this.colors.border
			.rgb()
			.array()
			.map(element => element / rgbIntegerScaleFactor);

		// Accent color
		let accentColor: Array<number> = this.colors.accent
			.rgb()
			.array()
			.map(element => element / rgbIntegerScaleFactor);

		this.shader = new Shader(ProgressBar.program, {
			accentColor,
			// Lower is more intense
			accentColorIntensity: 8,
			borderColor,
			borderRatio: 0.01,
			height,
			mainColor,
			maxValue,
			secondaryColor,
			value,
			width
		});

		this.mesh = new Mesh(ProgressBar.geometry, this.shader);
		this.scale = scale;
		this.container.addChild(this.mesh);
	}

	/**
	 * Remove progress bar dependencies from graphical memory, but preserve static objects for use by other bars.
	 */
	public destroy(): void {
		this.mesh.destroy();
		this.shader.destroy();
	}
}
