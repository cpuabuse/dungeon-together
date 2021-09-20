/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity that can be rendered.
 */

import { AnimatedSprite } from "pixi.js";
import { Uuid } from "../common/uuid";
import { CellPath } from "../comms/cell";
import { CommsEntity, CommsEntityArgs } from "../comms/entity";
import { ClientBaseClass } from "./base";
import { ClientCell } from "./cell";

/**
 * Generator for the client entity class.
 *
 * @returns Client entity class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientEntityFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * Render unit, representing the smallest renderable.
	 */
	class ClientEntity extends Base implements CommsEntity {
		/**
		 * Parent location.
		 */
		public cellUuid: Uuid;

		/**
		 * This.
		 */
		public entityUuid: Uuid;

		/**
		 * Map.
		 */
		public gridUuid: Uuid;

		/**
		 * Kind.
		 */
		public kindUuid: Uuid;

		/**
		 * Mode.
		 */
		public modeUuid: Uuid;

		/**
		 * Shard.
		 */
		public shardUuid: Uuid;

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
			// Call super constructor
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

			// Index
			this.universe.entitiesIndex.set(this.entityUuid, this);
		}

		/**
		 * Terminates the [[ClientEntity]].
		 */
		public terminate(): void {
			// Stop
			this.sprite.stop();
			this.universe.getShard(this).app.ticker.remove(this.tick, this);
			this.universe.getShard(this).gridContainer.removeChild(this.sprite);

			// Remove from index
			this.universe.entitiesIndex.delete(this.entityUuid);
		}

		/**
		 * Move entity to a different cell.
		 *
		 * @param cellPath - Path to the target cell
		 *
		 * @returns If successful or not
		 */
		protected doMove(cellPath: CellPath): boolean {
			// Locate target cell
			let targetCell: ClientCell = this.universe.getCell(cellPath);

			// Reattach
			if (targetCell.detach(this)) {
				this.shardUuid = targetCell.shardUuid;
				this.gridUuid = targetCell.gridUuid;
				this.cellUuid = targetCell.cellUuid;
				targetCell.attach(this);
				return true;
			}
			return false;
		}

		/**
		 * Render tick.
		 */
		private tick(): void {
			this.updateCoordinates();
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
	}

	// Return class
	return ClientEntity;
}

/**
 * Type of client shard class.
 */
export type ClientEntityClass = ReturnType<typeof ClientEntityFactory>;

/**
 * Instance type of client shard.
 */
export type ClientEntity = InstanceType<ClientEntityClass>;
