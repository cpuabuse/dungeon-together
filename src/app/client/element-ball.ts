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
	float hypotenuse = sqrt(relativeWidth * relativeWidth + relativeHeight * relativeHeight) * 0.8;

	gl_FragColor = vec4(
		secondaryColor.x,
		secondaryColor.y,
		(1.0 + sin(
			(2.0 * atan(
				- relativeWidth * sin(hypotenuse) + relativeHeight * cos(hypotenuse),
				relativeWidth * cos(hypotenuse) + relativeHeight * sin(hypotenuse)
			) + 3.1415926538) * 8.0
		)) / 2.0,
		1.0
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
export const elementBallColorWords = ["elementBallCenter", "elementBallEdge"] as const;

/**
 * Type representing colors in an element ball.
 */
export type ElementBallColors = Palette<typeof elementBallColorWords>;

/**
 *  Fire element ball colors.
 */
// Example for upcoming element balls such as thunder etc.
export const fireElementBallColorWords: ElementBallColors = {
	elementBallCenter: new Color("#d9420b"),
	elementBallEdge: new Color("#f2a20c")
};

/**
 * Element ball class.
 */
export class ElementBall {
	/**
	 *  Hp bar colors.
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

		this.shader = new Shader(ElementBall.program, {
			borderColor: [1, 0, 0],
			borderRatio: 0.01,
			height: 0.15,
			mainColor: [1, 1, 0],
			maxValue: 100,
			secondaryColor: [1, 0, 1],
			secondaryColorIntensity: 10,
			value: 0,
			width
		});

		this.mesh = new Mesh(ElementBall.geometry, this.shader);
		this.scale = scale;
		this.mesh.x = 500;
		this.container.addChild(this.mesh);
	}
}
