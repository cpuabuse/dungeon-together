/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file element-ball display.
 */
import Color from "color";
import { Container, Geometry, Mesh, Program, Shader } from "pixi.js";
import { Palette } from "../common/color";

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
varying float relativeWidth;
varying float relativeHeight;

void main() {
	relativeWidth = (-0.5 + coord.x / width) * 2.0;
	relativeHeight = (-0.5 + coord.y / width) * 2.0;
	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(coord, 1.0)).xyz, 1.0);
}
`;

/**
 *  FragmentSrc.
 */
// Needs to be adapted to new file
const fragmentSrc: string = `
#define PI 3.1415926538
precision mediump float;
varying float relativeWidth;
varying float relativeHeight;
uniform vec3 edgeColor;
uniform vec3 primaryArmColor;
uniform vec3 secondaryArmColor;
uniform vec3 centerColor;
uniform float edgeColorIntensity;
uniform float maxValue;
uniform float value;
uniform float height;

/*
	Returns an \`x\` coordinate, resulted by axis rotation of cartesian plane by angle.
*/
float rotateAxisX(float x, float y, float angle) {
	return y * cos(angle) - x * sin(angle);
}

/*
	Returns an \`y\` coordinate, resulted by axis rotation of cartesian plane by angle.
*/
float rotateAxisY(float x, float y, float angle) {
	return x * cos(angle) + y * sin(angle);
}

/*
	Returns a positive \`atan\` component, resulted by axis rotation of cartesian plane by angle.
	Produces values between \`0\` and \`π\` (produces symmetry, if used as operand of \`sin\`).
*/
float getAtanComponent(float x, float y, float angle) {
	return atan(
		rotateAxisX(x, y, angle),
		rotateAxisY(x, y, angle)
	) + PI;
}

void main() {
	float hypotenuse = sqrt(relativeWidth * relativeWidth + relativeHeight * relativeHeight);
	float atanComponent = getAtanComponent(relativeWidth, relativeHeight, hypotenuse * 0.8);
	float primaryRatio = (1.0 + sin(atanComponent * 8.0 + 10.0)) / 2.0;
	float secondaryRatio = (1.0 + sin(atanComponent * 13.0)) / 2.0;
	float opacity = hypotenuse * (primaryRatio + secondaryRatio + 2.0) / 4.0;

	// TODO: Hypotenuse needs to be rescaled to 1.0
	if (opacity > 1.0) {
		opacity = 1.0;
	}

	gl_FragColor = vec4(
		(primaryArmColor * primaryRatio + secondaryArmColor * secondaryRatio)/2.0 + (2.0 - primaryRatio - secondaryRatio) / 2.0 * centerColor,
		opacity
	);
}
`;

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
 *  Fire element ball colors.
 */
// Example for upcoming element balls such as thunder etc.
export const fireElementBallColorWords: ElementBallColors = {
	center: new Color("#F2CC0C"),
	edge: new Color("#8C1F07"),
	primaryArm: new Color("#d9420b"),
	secondaryArm: new Color("#F2A20C")
};

/**
 * Element ball class.
 */
export class ElementBall {
	/**
	 *  ElementBall colors.
	 */
	public colors: ElementBallColors;

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
		colors = fireElementBallColorWords,
		scale = 1
	}: {
		/**
		 * Container.
		 */
		container: Container;

		/**
		 * Colors.
		 */
		colors?: ElementBallColors;

		/**
		 * Scale.
		 */
		scale?: number;
	}) {
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
			centerColor,
			edgeColor,
			edgeColorIntensity: 10,
			height: 0.15,
			maxValue: 100,
			primaryArmColor,
			secondaryArmColor,
			value: 0,
			width
		});

		this.mesh = new Mesh(ElementBall.geometry, this.shader);
		this.scale = scale;
		this.mesh.x = 500;
		this.container.addChild(this.mesh);
	}
}
