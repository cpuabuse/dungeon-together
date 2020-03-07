/*
File: src/app/render/vao.ts
cpuabuse.com
*/

/**
 * Vector array object.
 */

import { Application, BaseTexture, Sprite, Texture } from "pixi.js";

/**
 * The vector representing a point of display.
 */
interface Vector {
	/**
	 * X coordinate.
	 */
	x: number;

	/**
	 * Y coordinate.
	 */
	y: number;

	/**
	 * Z coordinate.
	 */
	z: number;
}

/**
 * Render unit, representing the smallest renderable.
 */
class Ru implements Vector {
	/**
	 * X coordinate.
	 */
	x: number;

	/**
	 * Y coordinate.
	 */
	y: number;

	/**
	 * Z coordinate.
	 */
	z: number;

	/**
	 * Initializes RU.
	 */
	constructor({ x = 0, y = 0, z = 0 }: { x?: number; y?: number; z?: number }) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

/**
 * Vector array object.
 */
export class Vao {
	/**
	 * Array of vectors representing cell grid.
	 */
	rus: Array<Ru> = new Array();

	/**
	 * Constructs VAO.
	 */
	constructor(app: Application) {
		this.rus.push(new Ru({}));
		this.rus.push(new Ru({ x: 1 }));
		this.rus.push(new Ru({ x: 2 }));
		this.rus.push(new Ru({ x: 3 }));
		this.rus.push(new Ru({ x: 4 }));
		this.rus.forEach(function(ru) {
			// Create a new base texture from an image path
			const bunnyBaseTexture: BaseTexture = new BaseTexture("img/bunny.png");

			// Create a new texture from base texture
			const bunnyTexture: Texture = new Texture(bunnyBaseTexture);

			// Create a new Sprite from texture
			const bunnySprite: Sprite = new Sprite(bunnyTexture);

			bunnySprite.x = 100 * ru.x;
			bunnySprite.height = 100;
			bunnySprite.width = 100;
			app.stage.addChild(bunnySprite);
		});
	}
}
