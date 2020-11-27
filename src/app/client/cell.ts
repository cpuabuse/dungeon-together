/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Squares on screen.
 */

import { CommsCell, CommsCellArgs } from "../comms/cell";
import { CommsEntityArgs, EntityPath } from "../comms/entity";
import { Uuid, getDefaultUuid } from "../common/uuid";
import {
	defaultKindUuid,
	defaultModeUuid,
	defaultWorldUuid,
	entityUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { ClientEntity } from "./entity";
import { ClientProto } from "./proto";

/**
 * Square(Vector).
 */
export class ClientCell extends ClientProto implements CommsCell {
	/**
	 * UUID for default [[ClientEntity]].
	 */
	public readonly defaultEntityUuid: Uuid;

	/**
	 * CommsShard path.
	 */
	public readonly shardUuid: Uuid;

	/**
	 * This CommsCell UUID.
	 */
	public readonly cellUuid: Uuid;

	/**
	 * This id.
	 */
	public readonly gridUuid: Uuid;

	/**
	 * Contents of client-cell.
	 */
	public readonly entities: Map<Uuid, ClientEntity> = new Map();

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
				this.entities.set(entity.entityUuid, new ClientEntity(entity));
			});
		});
	}

	/**
	 * Adds [[CommsEntity]].
	 */
	public addEntity(entity: CommsEntityArgs): void {
		if (this.entities.has(entity.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveEntity(entity);
		}
		// It does not perform the check for "entityUuid" because there is no default
		this.entities.set(entity.entityUuid, new ClientEntity(entity));
	}

	/**
	 * Shortcut to get the [[ClientEntity]].
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
