/*
File: src/app/render/vao.ts
cpuabuse.com
*/

/**
 * Vector array object.
 */

import { AnimatedSprite, Application, BaseTexture, Sprite, Texture } from "pixi.js";
import { Location, Map, Occupant } from "../comms/comms";

/**
 * Default mode string.
 * Linked to modes interface.
 */
const defaultMode: string = "default";

/**
 * The vector representing a point of display.
 */
export interface Vector {
	/**
	 * X coordinate.
	 */
	x?: number;

	/**
	 * Y coordinate.
	 */
	y?: number;

	/**
	 * Z coordinate.
	 */
	z?: number;
}

/**
 * The vector representing a point of display.
 * Definitely 3D.
 */
export interface Vector3D extends Vector {
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
 * Display mode.
 */
export interface Mode {
	/**
	 * Animated sprite.
	 */
	sprite: AnimatedSprite;
}

/**
 * Display mode for RU.
 */
export interface Modes {
	/**
	 * Modes.
	 */
	[key: string]: Mode;

	/**
	 * Special mandatory default mode.
	 */
	default: Mode;
}

/**
 * Render unit, representing the smallest renderable.
 */
export class Ru implements Occupant {
	/**
	 * Parent location.
	 */
	location: Square;

	/**
	 * Mode.
	 */
	mode: string = defaultMode;

	/**
	 * Modes of dispay.
	 */
	private modes: Modes;

	/**
	 * Initializes RU.
	 */
	public constructor(square: Square, app: Application) {
		// Set this square
		this.location = square;

		// Create a new base texture from an image path
		const bunnyBaseTexture: BaseTexture = new BaseTexture("img/bunny.svg");

		// Create a new texture from base texture
		const bunnyTexture: Texture = new Texture(bunnyBaseTexture);

		// Create a new Sprite from texture
		const bunnySprite: Sprite = new Sprite(bunnyTexture);

		bunnySprite.x = 100 * square.x;
		bunnySprite.y = 100 * square.y;
		bunnySprite.height = 100;
		bunnySprite.width = 100;
		app.stage.addChild(bunnySprite);

		app.ticker.add(() => {
			bunnySprite.x = 100 * this.location.x;
			bunnySprite.y = 100 * this.location.y;
		});
	}
}

/**
 * Square(Vector).
 */
export class Square implements Location, Vector3D {
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
	 * Contents of square.
	 */
	occupants: Array<Ru> = new Array();

	/**
	 * Constructs square.
	 */
	constructor(app: Application, { x = 0, y = 0, z = 0 }: Vector, occupants?: Array<unknown>) {
		// Initialize coordinates
		this.x = x;
		this.y = y;
		this.z = z;

		// Fill occupants
		if (occupants !== undefined) {
			occupants.forEach(() => {
				this.occupants.push(new Ru(this, app));
			});
		}
	}
}

/**
 * Vector Array Object.
 */
export class Vao implements Map {
	/**
	 * Locations.
	 */
	locations: Array<Square> = new Array();
}
