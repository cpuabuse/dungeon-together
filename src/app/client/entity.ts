/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Renderable unit.
 */

import { CommsEntity, CommsEntityArgs } from "../comms/entity";
import { AnimatedSprite } from "pixi.js";
import { ClientProto } from "./proto";
import { Uuid } from "../common/uuid";

/**
 * Render unit, representing the smallest renderable.
 */
export class ClientEntity extends ClientProto implements CommsEntity {
	/**
	 * Shard.
	 */
	public shardUuid: Uuid;

	/**
	 * Parent location.
	 */
	public cellUuid: Uuid;

	/**
	 * Kind.
	 */
	public kindUuid: Uuid;

	/**
	 * Map.
	 */
	public gridUuid: Uuid;

	/**
	 * Mode.
	 */
	public modeUuid: Uuid;

	/**
	 * This.
	 */
	public entityUuid: Uuid;

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
	public constructor({ shardUuid, cellUuid, kindUuid, gridUuid, modeUuid, entityUuid, worldUuid }: CommsEntityArgs) {
		// Call superconstructor
		super();

		// Assing members from interface
		this.shardUuid = shardUuid;
		this.cellUuid = cellUuid;
		this.kindUuid = kindUuid;
		this.gridUuid = gridUuid;
		this.modeUuid = modeUuid;
		this.entityUuid = entityUuid;
		this.worldUuid = worldUuid;

		// Create a new Sprite from texture
		this.sprite = new AnimatedSprite(this.universe.getMode({ uuid: this.modeUuid }).textures);

		// Set coordinates initially
		this.updateCoordinates();

		// Add to container
		this.universe.getShard(this).gridContainer.addChild(this.sprite);

		// Set ticker
		this.universe.getShard(this).app.ticker.add(this.tick, this);

		// Start
		this.sprite.play();
	}

	/**
	 * Terminates the [[ClientEntity]].
	 */
	public terminate(): void {
		// Stop
		this.sprite.stop();
		this.universe.getShard(this).app.ticker.remove(this.tick, this);
		this.universe.getShard(this).gridContainer.removeChild(this.sprite);
	}

	/**
	 * Updates coordinates for render.
	 */
	private updateCoordinates(): void {
		this.sprite.x = this.universe.getShard(this).sceneWidth * this.universe.getCell(this).x;
		this.sprite.y = this.universe.getShard(this).sceneHeight * this.universe.getCell(this).y;
		this.sprite.height = this.universe.getShard(this).sceneWidth;
		this.sprite.width = this.universe.getShard(this).sceneHeight;
	}

	/**
	 * Render tick.
	 */
	private tick(): void {
		this.updateCoordinates();
	}
}
