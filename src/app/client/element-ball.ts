/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file element-ball display.
 */
import Color from "color";
import { Container, Geometry, Mesh, Program, Shader, Ticker } from "pixi.js";
import { Palette } from "../common/color";
import fragmentSrc from "./fragment.glsl";

/**
 *  VertexSrc.
 */
// Needs to be adapted to new file
const vertexSrc: string = `
precision mediump float;
attribute vec2 coord;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
uniform float width;
uniform float height;
varying float relativeWidth;
varying float relativeHeight;

void main() {
	relativeWidth = (-0.5 + coord.x / width) * 2.0;
	relativeHeight = (-0.5 + coord.y / height) * 2.0;
	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(coord, 1.0)).xyz, 1.0);
}
`;

/**
 * Uniform type interface.
 */
export type ElementBallArgs = {
	/**
	 * Uniforms.
	 */
	uniforms: {
		/**
		 * Baseline alpha curve; Positive values, including `0`; The higher the curve, the more opaque the hollow edges will be; `0` is completely opaque, `1` is linear.
		 */
		baseAlphaCurve: number;

		/**
		 * Proportion of center color dominant area; Positive number, excluding zero; Greater than `0` to `1` increases center area, `1` is linear, greater than `1` decreases center area.
		 */
		centerCurve: number;

		/**
		 * Edge Color Intensity.
		 */
		edgeColorIntensity: number;

		/**
		 * Center fade out end; Values from `0` to `1`.
		 */
		fadeOutEnd: number;

		/**
		 * Center fade out start; Values from `0` to `1`.
		 */
		fadeOutStart: number;

		/**
		 * Maximum alpha at edge, before substraction of hollow mask; Changes "thickness" of arms at edges; Values from `0` to `1`.
		 */
		maxEdgeAlpha: number;

		/**
		 * Curve of primary arm; Any number; Positive values curve right, negative values curve left; The closer primary/secondary curves are, the more moving arms will look like merging/disappearing/reappearing.
		 */
		primaryArmCurve: number;

		/**
		 * Primary arm rotation.
		 */
		primaryArmRotation: number;

		/**
		 * Positive values, including zero; The higher the curve.
		 */
		primaryArmThicknessCurve: number;

		/**
		 * Curve of secondary arm; Any number; Positive values curve right, negative values curve left; The closer primary/secondary curves are, the more moving arms will look like merging/disappearing/reappearing.
		 */
		secondaryArmCurve: number;

		/**
		 * Secondary arm rotation.
		 */
		secondaryArmRotation: number;

		/**
		 * Secondary arm thickness curve.
		 */
		secondaryArmThicknessCurve: number;
	};

	/**
	 * Colors.
	 */
	colors: ElementBallColors;
};

/**
 * Width.
 */
const width: number = 1;

/**
 * Height.
 */
const height: number = 1;

/**
 * Element bar parts tuple.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const elementBallColorWords = ["center", "edge", "primaryArm", "secondaryArm"] as const;

/**
 * Type representing colors in an element ball.
 */
export type ElementBallColors = Palette<typeof elementBallColorWords>;

/**
 * Thunder element ball colors.
 */
export const darkThunderElementBallColorWords: ElementBallColors = {
	center: new Color("#FFFFFF"),
	edge: new Color("#F2E852"),
	primaryArm: new Color("#F2E852"),
	secondaryArm: new Color("#020E26")
};

/**
 * Element ball class.
 */
export class ElementBall {
	/**
	 * Dark Thunder ball.
	 */
	public static DarkThunderBall: ElementBallArgs = {
		colors: {
			center: new Color("#FFFFFF"),
			edge: new Color("#F2E852"),
			primaryArm: new Color("#F2E852"),
			secondaryArm: new Color("#020E26")
		},
		uniforms: {
			baseAlphaCurve: 10.0,
			centerCurve: 4.0,
			edgeColorIntensity: 10,
			fadeOutEnd: 0.9,
			fadeOutStart: 0.6,
			maxEdgeAlpha: 0.5,
			primaryArmCurve: 8.4,
			primaryArmRotation: 0,
			primaryArmThicknessCurve: 5.0,
			secondaryArmCurve: 8.4,
			secondaryArmRotation: 0,
			secondaryArmThicknessCurve: 5.0
		}
	};

	/**
	 * ElementBall colors.
	 */
	public colors: ElementBallColors;

	/**
	 * Fire ball.
	 */
	public static fireBall: ElementBallArgs = {
		colors: {
			center: new Color("#FFFFFF"),
			edge: new Color("#FCDFD7"),
			primaryArm: new Color("#d9420b"),
			secondaryArm: new Color("#F2A20C")
		},
		uniforms: {
			baseAlphaCurve: 10.0,
			centerCurve: 5.0,
			edgeColorIntensity: 10,
			fadeOutEnd: 0.9,
			fadeOutStart: 0.6,
			maxEdgeAlpha: 0.5,
			primaryArmCurve: 1.4,
			primaryArmRotation: 0,
			primaryArmThicknessCurve: 2.0,
			secondaryArmCurve: 1.4,
			secondaryArmRotation: 0,
			secondaryArmThicknessCurve: 2.0
		}
	};

	/**
	 * Mesh.
	 */
	public mesh: Mesh<Shader>;

	/**
	 *Shader.
	 */
	public shader: Shader;

	/**
	 * Water Ball.
	 */
	public static waterBall: ElementBallArgs = {
		colors: {
			center: new Color("#FFFFFF"),
			edge: new Color("#C0E0FF"),
			primaryArm: new Color("#0000FF"),
			secondaryArm: new Color("#00FFFF")
		},
		uniforms: {
			baseAlphaCurve: 10.0,
			centerCurve: 5.0,
			edgeColorIntensity: 10,
			fadeOutEnd: 0.9,
			fadeOutStart: 0.6,
			maxEdgeAlpha: 0.5,
			primaryArmCurve: 1.4,
			primaryArmRotation: 0,
			primaryArmThicknessCurve: 2.0,
			secondaryArmCurve: -1.4,
			secondaryArmRotation: 0,
			secondaryArmThicknessCurve: 2.0
		}
	};

	/**
	 * Wind ball.
	 */
	public static windBall: ElementBallArgs = {
		colors: {
			center: new Color("#FFFFFF"),
			edge: new Color("#7FA646"),
			primaryArm: new Color("#57731A"),
			secondaryArm: new Color("#A2BF39")
		},
		uniforms: {
			baseAlphaCurve: 10.0,
			centerCurve: 8.0,
			edgeColorIntensity: 10,
			fadeOutEnd: 0.9,
			fadeOutStart: 0.6,
			maxEdgeAlpha: 0.5,
			primaryArmCurve: -1.4,
			primaryArmRotation: 0,
			primaryArmThicknessCurve: 5.0,
			secondaryArmCurve: -1.4,
			secondaryArmRotation: 0,
			secondaryArmThicknessCurve: 5.0
		}
	};

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
	 * Container.
	 */
	private container: Container;

	/**
	 *  Geometry for the element ball.
	 */
	private static geometry: Geometry = ((): Geometry => {
		const geometry: Geometry = new Geometry().addAttribute(
			"coord",
			[0, 0, 0, height, 1, height, 1, 0].map(element => element),
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
	private static program: Program = new Program(vertexSrc, fragmentSrc, `ElementBallProgram`);

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	// Needs changes to adapt to file
	public constructor({
		container,
		colors,
		scale = 1,
		uniforms
	}: {
		/**
		 * Container.
		 */
		container: Container;

		/**
		 * Scale.
		 */
		scale?: number;
	} & ElementBallArgs) {
		this.container = container;
		this.colors = colors;

		// Center color.
		const centerColor: Array<number> = this.colors.center
			.rgb()
			.array()
			.map(element => element / 255);

		// Primary arm color.
		const primaryArmColor: Array<number> = this.colors.primaryArm
			.rgb()
			.array()
			.map(element => element / 255);

		// Secondary arm color.
		const secondaryArmColor: Array<number> = this.colors.secondaryArm
			.rgb()
			.array()
			.map(element => element / 255);

		// Edge color.
		const edgeColor: Array<number> = this.colors.edge
			.rgb()
			.array()
			.map(element => element / 255);

		this.shader = new Shader(ElementBall.program, {
			...uniforms,
			centerColor,
			edgeColor,
			height,
			primaryArmColor,
			secondaryArmColor,
			value: 0,
			width
		});

		const ticker: Ticker = Ticker.shared;
		ticker.add(time => {
			this.shader.uniforms.primaryArmRotation += 0.1;
			this.shader.uniforms.secondaryArmRotation += 0.14;
		});

		this.mesh = new Mesh(ElementBall.geometry, this.shader);
		this.scale = scale;

		this.mesh.x = 250;
		this.container.addChild(this.mesh);
	}
}