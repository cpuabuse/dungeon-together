/*
	File: src/app/render/ru.ts
	cpuabuse.com
*/

/**
 * Renderable unit.
 */

import { AnimatedSprite } from "pixi.js";
import { Occupant } from "../comms/interfaces";
import { Screen } from "./screen";
import { Square } from "./square";
import { defaultMode } from "../common/defaults";

/**
 * Args for [[Ru]] constructor.
 */
export interface RuArgs extends Occupant {
	square: Square;
	screen: Screen;
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
	public mode: string;

	/**
	 * Animated sprite.
	 */
	public sprite: AnimatedSprite;

	/**
	 * Initializes RU.
	 */
	public constructor({ mode = defaultMode, square, screen }: RuArgs) {
		// Set this square
		this.location = square;

		// Set mode
		this.mode = mode;

		// Create a new Sprite from texture
		this.sprite = new AnimatedSprite(screen.modes[this.mode].textures);
		this.sprite.animationSpeed = 0.03;
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
