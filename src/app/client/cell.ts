/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Squares on screen.
 */

import {
	defaultKindUuid,
	defaultModeUuid,
	defaultWorldUuid,
	entityUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { CommsCell, CommsCellArgs } from "../comms/cell";
import { CommsEntityArgs, EntityPath } from "../comms/entity";
import { ClientBaseClass } from "./base";
import { ClientEntity } from "./entity";

/**
 * Generator for the client cell class.
 *
 * @returns Client cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientCellFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * Square(Vector).
	 */
	class ClientCell extends Base implements CommsCell {
		/**
		 * This CommsCell UUID.
		 */
		public readonly cellUuid: Uuid;

		/**
		 * UUID for default [[ClientEntity]].
		 */
		public readonly defaultEntityUuid: Uuid;

		/**
		 * Contents of client-cell.
		 */
		public readonly entities: Map<Uuid, ClientEntity> = new Map();

		/**
		 * This id.
		 */
		public readonly gridUuid: Uuid;

		/**
		 * CommsShard path.
		 */
		public readonly shardUuid: Uuid;

		/**
		 * Worlds of this.
		 */
		public worlds: Set<Uuid> = new Set();

		/**
		 * X coordinate.
		 */
		public x: number;

		/**
		 * Y coordinate.
		 */
		public y: number;

		/**
		 * Z coordinate.
		 */
		public z: number;

		/**
		 * Constructs square.
		 */
		public constructor({ shardUuid, cellUuid, gridUuid, entities, x, y, z }: CommsCellArgs) {
			super();

			// Initialize path
			this.shardUuid = shardUuid;
			this.cellUuid = cellUuid;
			this.gridUuid = gridUuid;

			// Initialize coordinates
			this.x = x;
			this.y = y;
			this.z = z;

			// Set default Uuid
			this.shardUuid = shardUuid;
			this.defaultEntityUuid = getDefaultUuid({
				path: `${entityUuidUrlPath}${urlPathSeparator}${this.cellUuid}`
			});

			setTimeout(() => {
				// Populate with default [[ClientEntity]]
				this.addEntity({
					// Take path from this
					...this,
					entityUuid: this.defaultEntityUuid,
					kindUuid: defaultKindUuid,
					modeUuid: defaultModeUuid,
					worldUuid: defaultWorldUuid
				});

				// Fill entities
				entities.forEach(entity => {
					this.entities.set(entity.entityUuid, new this.universe.Entity(entity));
				});
			});
		}

		/**
		 * Adds [[CommsEntity]].
		 *
		 * @param entity - Arguments for the [[ClientEntity]] constructor
		 */
		public addEntity(entity: CommsEntityArgs): void {
			if (this.entities.has(entity.shardUuid)) {
				// Clear the shard if it already exists
				this.doRemoveEntity(entity);
			}
			// It does not perform the check for "entityUuid" because there is no default
			this.entities.set(entity.entityUuid, new this.universe.Entity(entity));
		}

		/**
		 * Shortcut to get the [[ClientEntity]].
		 *
		 * @returns [[ClientEntity]], the smallest renderable
		 */
		public getEntity({ entityUuid }: EntityPath): ClientEntity {
			let clientEntity: ClientEntity | undefined = this.entities.get(entityUuid);
			// Default scene is always there
			return clientEntity === undefined ? (this.entities.get(this.defaultEntityUuid) as ClientEntity) : clientEntity;
		}

		/**
		 * Actually remove the [[ClientEntity]] instance from "clientCell".
		 *
		 * Unlike other clientProtos, this function does not use "doRemoveEntity", because there is no default scene.
		 *
		 * @param path - Path to entity
		 */
		public removeEntity(path: EntityPath): void {
			if (path.entityUuid !== this.defaultEntityUuid) {
				this.doRemoveEntity(path);
			}
		}

		/**
		 * Terminates the [[Cell]].
		 */
		public terminate(): void {
			this.entities.forEach(clientEntity => {
				this.removeEntity(clientEntity);
			});
		}

		/**
		 * Updates the cell's entities.
		 *
		 * Eventually, when the entity is not in the arguments but is present in this cell, it should be either made invisible, or sent to a separate world.
		 */
		public update({ shardUuid, cellUuid, gridUuid, entities, x, y, z }: CommsCellArgs): void {
			// Rewrite coordinates
			this.x = x;
			this.y = y;
			this.z = z;

			// Move entities here
			entities.forEach(entity => {});
		}

		/**
		 * Actually removes the entity.
		 */
		private doRemoveEntity({ entityUuid }: EntityPath): void {
			let clientEntity: ClientEntity | undefined = this.entities.get(entityUuid);
			if (clientEntity !== undefined) {
				clientEntity.terminate();
				this.entities.delete(entityUuid);
			}
		}
	}

	// Return the class
	return ClientCell;
}

/**
 * Type of client shard class.
 */
export type ClientCellClass = ReturnType<typeof ClientCellFactory>;

/**
 * Instance type of client shard.
 */
export type ClientCell = InstanceType<ClientCellClass>;
