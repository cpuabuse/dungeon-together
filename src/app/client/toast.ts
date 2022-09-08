/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Toast animation.
 *
 * @file
 */

import { AnimatedSprite } from "pixi.js";
import { Uuid } from "../common/uuid";
import { Vector } from "../common/vector";
import { ClientShard, ClientShardClass } from "./shard";

/**
 * Creates a temporary toast.
 * Functional approach is used, since toast animation is short lived, and does not really represent an object.
 */
export class ClientToast {
	/**
	 * Time animation will show in milliseconds and disappears.
	 */
	public displayTime: number;

	/**
	 * Client shard.
	 */
	private shard: ClientShard;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		shard,
		displayTime
	}: {
		/**
		 * Client shard.
		 */
		shard: ClientShard;

		/**
		 * Time to display in ms.
		 */
		displayTime: number;
	}) {
		this.shard = shard;
		this.displayTime = displayTime;
	}

	/**
	 * Shows the toast.
	 *
	 * @param param - Destructured parameter
	 */
	public show({
		x,
		y,
		z,
		modeUuid
	}: Vector & {
		/**
		 * Mode to show.
		 */
		modeUuid: Uuid;
	}): void {
		let sprite: AnimatedSprite = new AnimatedSprite(
			(this.shard.constructor as ClientShardClass).universe.getMode({ uuid: modeUuid }).textures
		);

		/**
		 * Animate toast.
		 */
		function tick(): void {
			if (sprite.alpha > 0) {
				sprite.alpha -= 0.005;
				sprite.y -= 1;
			}
		}

		// Update entity position, do it before adding to container, to avoid jumps on screen
		sprite.x = x;
		sprite.y = y;
		sprite.height = this.shard.sceneWidth;
		sprite.width = this.shard.sceneHeight;

		this.shard.gridContainer.addChild(sprite);
		sprite.play();

		this.shard.app.ticker.add(tick);

		// Destroy sprite
		setTimeout(() => {
			this.shard.app.ticker.remove(tick);
			sprite.destroy();
		}, this.displayTime);
	}
}
