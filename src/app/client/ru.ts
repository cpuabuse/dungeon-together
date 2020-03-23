/*
	File: src/app/render/ru.ts
	cpuabuse.com
*/

/**
 * Renderable unit.
 */

import {
	CommsMapUuid,
	InstanceUuid,
	KindUuid,
	LocationUuid,
	ModeUuid,
	Occupant,
	OccupantUuid,
	WorldUuid
} from "../shared/interfaces";
import { AnimatedSprite } from "pixi.js";
import { Screen } from "./screen";
import { Square } from "./square";
import { defaultMode } from "../common/defaults";
import { Screenable } from "./screenable";

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
export class Ru extends Screenable implements Occupant {
	/**
	 * Screen.
	 */
	public instance: InstanceUuid;

	/**
	 * Parent location.
	 */
	public location: LocationUuid;

	/**
	 * Kind.
	 */
	public kind: KindUuid;

	/**
	 * Map.
	 */
	public map: CommsMapUuid | null;

	/**
	 * Mode.
	 */
	public mode: ModeUuid;

	/**
	 * This.
	 */
	public occupant: OccupantUuid;

	/**
	 * Animated sprite.
	 */
	public sprite: AnimatedSprite;

	/**
	 * World.
	 */
	public world: WorldUuid;

	/**
	 * Initializes RU.
	 */
	public constructor({ instance, location, kind, map, mode, occupant, world }: Occupant) {
		// Ceremoniously call superconstructor
		super();

		// Assing members from interface
		this.instance = instance;
		this.location = location;
		this.kind = kind;
		this.map = map;
		this.mode = mode;
		this.occupant = occupant;
		this.world = world;

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
