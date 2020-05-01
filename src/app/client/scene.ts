/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Renderable unit.
 */

import { Occupant, OccupantArgs } from "../shared/comms/occupant";
import { AnimatedSprite } from "pixi.js";
import { Clientable } from "./clientable";
import { Uuid } from "../common/uuid";

/**
 * Render unit, representing the smallest renderable.
 */
export class Scene extends Clientable implements Occupant {
	/**
	 * Canvas.
	 */
	public instanceUuid: Uuid;

	/**
	 * Parent location.
	 */
	public locusUuid: Uuid;

	/**
	 * Kind.
	 */
	public kindUuid: Uuid;

	/**
	 * Map.
	 */
	public mappaUuid: Uuid;

	/**
	 * Mode.
	 */
	public modeUuid: Uuid;

	/**
	 * This.
	 */
	public occupantUuid: Uuid;

	/**
	 * Animated sprite.
	 */
	public sprite: AnimatedSprite;

	/**
	 * World.
	 */
	public worldUuid: Uuid;

	/**
	 * Initializes RU.
	 */
	public constructor({
		instanceUuid,
		locusUuid,
		kindUuid,
		mappaUuid,
		modeUuid,
		occupantUuid,
		worldUuid
	}: OccupantArgs) {
		// Call superconstructor
		super();

		// Assing members from interface
		this.instanceUuid = instanceUuid;
		this.locusUuid = locusUuid;
		this.kindUuid = kindUuid;
		this.mappaUuid = mappaUuid;
		this.modeUuid = modeUuid;
		this.occupantUuid = occupantUuid;
		this.worldUuid = worldUuid;

		// Create a new Sprite from texture
		this.sprite = new AnimatedSprite(this.pool.getMode({ uuid: this.modeUuid }).textures);

		// Set coordinates initially
		this.updateCoordinates();

		// Add to container
		this.pool.getInstance(this).gridContainer.addChild(this.sprite);

		// Set ticker
		this.pool.getInstance(this).app.ticker.add(this.tick, this);

		// Start
		this.sprite.play();
	}

	/**
	 * Terminates the [[Scene]].
	 */
	public terminate(): void {
		// Stop
		this.sprite.stop();
		this.pool.getInstance(this).app.ticker.remove(this.tick, this);
		this.pool.getInstance(this).gridContainer.removeChild(this.sprite);
	}

	/**
	 * Updates coordinates for render.
	 */
	private updateCoordinates(): void {
		this.sprite.x = this.pool.getInstance(this).sceneWidth * this.pool.getLocus(this).x;
		this.sprite.y = this.pool.getInstance(this).sceneHeight * this.pool.getLocus(this).y;
		this.sprite.height = this.pool.getInstance(this).sceneWidth;
		this.sprite.width = this.pool.getInstance(this).sceneHeight;
	}

	/**
	 * Render tick.
	 */
	private tick(): void {
		this.updateCoordinates();
	}
}
