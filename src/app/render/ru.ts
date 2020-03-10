/*
	File: src/app/render/ru.ts
	cpuabuse.com
*/

/**
 * Renderable unit.
 */

import { AnimatedSprite, Application, Texture } from "pixi.js";
import { Occupant } from "../comms/interfaces";
import { Screen } from "./screen";
import { Square } from "./square";

/**
 * Default mode string.
 * Linked to modes interface.
 */
const defaultMode: string = "default";

/**
 * Display mode.
 */
export interface Mode {
	/**
	 * Animated sprite.
	 */
	textures: Array<Texture>;
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
	public location: Square;

	/**
	 * Mode.
	 */
	public mode: string = defaultMode;

	/**
	 * Animated sprite.
	 */
	public sprite: AnimatedSprite;

	/**
	 * Initializes RU.
	 */
	public constructor(square: Square, screen: Screen) {
		// Set this square
		this.location = square;

		// Create a new Sprite from texture
		this.sprite = new AnimatedSprite(screen.animations.default.textures);
		this.sprite.animationSpeed = 0.015;
		this.sprite.play();

		this.sprite.x = 100 * square.x;
		this.sprite.y = 100 * square.y;
		this.sprite.height = 100;
		this.sprite.width = 100;
		screen.app.stage.addChild(this.sprite);

		screen.app.ticker.add(() => {
			this.sprite.x = 100 * this.location.x;
			this.sprite.y = 100 * this.location.y;
		});
	}
}
