/*
	Copyright 2023 cpuabuse.com
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
import { ClientCell, ClientCellClass } from "./cell";

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
	 * Container.
	 */
	private cell: ClientCell;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		cell,
		displayTime
	}: {
		/**
		 * Client shard.
		 */
		cell: ClientCell;

		/**
		 * Time to display in ms.
		 */
		displayTime: number;
	}) {
		this.cell = cell;
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
		modeUuid,
		isFloating = true
	}: Vector & {
		/**
		 * Mode to show.
		 */
		modeUuid: Uuid;

		/**
		 * Whether to float or not.
		 */
		isFloating?: boolean;
	}): void {
		let sprite: AnimatedSprite = new AnimatedSprite(
			(this.cell?.constructor as ClientCellClass).universe.getMode({ uuid: modeUuid }).textures
		);

		/**
		 * Animate toast.
		 */
		function tick(): void {
			if (sprite.alpha > 0) {
				sprite.alpha -= 0.005;
				if (isFloating) {
					sprite.y -= 1;
				}
			}
		}

		// Update entity position, do it before adding to container, to avoid jumps on screen
		sprite.x = x;
		sprite.y = y;
		sprite.height = this.cell.shard?.sceneWidth ?? 0;
		sprite.width = this.cell.shard?.sceneHeight ?? 0;

		// TODO: Must attach to z container
		this.cell.container.addChild(sprite);
		sprite.play();

		this.cell.shard?.app.ticker.add(tick);

		// Destroy sprite
		setTimeout(() => {
			this.cell.shard?.app.ticker.remove(tick);
			sprite.destroy();
		}, this.displayTime);
	}
}
