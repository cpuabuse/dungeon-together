/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Cells making up the grid.
 */

import { CellPath, CommsCell, CommsCellArgs } from "../comms/comms-cell";
import { ServerEntity, ServerEntityArgs } from "./server-entity";
import { Uuid, getDefaultUuid } from "../common/uuid";
import {
	defaultKindUuid,
	defaultModeUuid,
	defaultWorldUuid,
	entityUuidUrlPath,
	navAmount,
	urlPathSeparator
} from "../common/defaults";
import { EntityPath } from "../comms/comms-entity";
import { ServerProto } from "./server-proto";

/**
 * Navigation.
 */
export type Nav = Array<CellPath>;

/**
 * Arguments for the [[ServerCell]] constructor.
 */
export interface ServerCellArgs extends CommsCellArgs {
	nav: Nav;
	entities: Map<Uuid, ServerEntityArgs>;
}

/**
 * The cell within the grid.
 */
export class ServerCell extends ServerProto implements CommsCell {
	/**
	 * Default [[ServerEntity]] UUID.
	 */
	public defaultEntityUuid: Uuid;

	/**
	 * Parent universe.
	 */
	public readonly shardUuid: Uuid;

	/**
	 * CommsGrid path.
	 */
	public readonly gridUuid: Uuid;

	/**
	 * Navigation.
	 */
	public readonly nav: Nav = new Array(navAmount).fill(this);

	/**
	 * Place entities.
	 */
	public readonly entities: Map<Uuid, ServerEntity> = new Map();

	/**
	 * Coordinates in grid. An id given during creation. Does not represent anything visually or logically.
	 */
	public readonly cellUuid: string;

	/**
	 * Indicates which world this cell is part of.
	 */
	public worlds: Set<Uuid>;

	/**
	 * X represention.
	 */
	public x: number;

	/**
	 * Y represention.
	 */
	public y: number;

	/**
	 * Z represention.
	 */
	public z: number;

	/**
	 * Cell constructor.
	 *
	 * Creates nowhere by default.
	 * @param nav Can be less than [[navAmount]], then `this.nav` will be filled with `this`, if longer than [[navAmount]], then extra values will be ignored
	 */
	public constructor({ shardUuid, cellUuid, gridUuid, nav, entities, worlds, x, y, z }: ServerCellArgs) {
		// ServerProto
		super();

		// Set path
		this.shardUuid = shardUuid;
		this.gridUuid = gridUuid;
		this.cellUuid = cellUuid;

		// Set coordinates
		this.x = x;
		this.y = y;
		this.z = z;

		// Set nav, but be gentle about the values we recieve
		for (let i: number = 0; i < navAmount && i < nav.length; i++) {
			this.nav[i] = nav[i];
		}

		// Initialize "defaultEntityUuid"
		this.defaultEntityUuid = getDefaultUuid({
			path: `${entityUuidUrlPath}${urlPathSeparator}${this.cellUuid}`
		});

		// Set world; Generate a new object
		this.worlds = new Set([...worlds, defaultWorldUuid]);

		setTimeout(() => {
			// Set default entity
			this.addEntity({
				...this,
				entityUuid: this.defaultEntityUuid,
				kindUuid: defaultKindUuid,
				modeUuid: defaultModeUuid,
				worldUuid: defaultWorldUuid
			});

			// Initialize manifests
			this.worlds.forEach(worldUuid => {
				let {
					kinds
				}: {
					kinds: Set<Uuid>;
				} = this.universe.getWorld({
					uuid: worldUuid
				});

				kinds.forEach(kindUuid => {
					this.universe
						.getKind({
							uuid: kindUuid
						})
						.typeOfThing.initialize({
							...this,
							kindUuid,
							worldUuid
						});
				});
			});

			// Initialize entities
			entities.forEach(serverEntity => {
				this.addEntity(serverEntity);
			});
		});
	}

	/**
	 * Adds [[ServerEntity]].
	 */
	public addEntity(serverEntity: ServerEntityArgs): void {
		if (this.entities.has(entity.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveEntity(entity);
		}
		let TypeOfEntity: typeof ServerEntity = this.universe.getKind({ uuid: entity.kind }).typeOfEntity;

		// The "TypeOfEntity" will be classes extending "ServerEntity", so abstract class should not be created
		// @ts-ignore
		new TypeOfEntity({
			...entity,
			cellUuid: this.cellUuid,
			gridUuid: this.gridUuid,
			shardUuid: this.shardUuid
		}).initialize();
	}

	/**
	 * Attach [[ServerEntity]] to [[Locus]].
	 */
	public attach(serverEntity: ServerEntity): void {
		this.entities.set(serverEntity.entityUuid, serverEntity);
	}

	/**
	 * Detach [[ServerEntity]] from [[CommsCell]].
	 */
	public detach({ entityUuid }: ServerEntity): void {
		if (this.entities.has(entityUuid)) {
			this.entities.delete(entityUuid);
		}
	}

	/**
	 * Gets [[CommsEntity]].
	 */
	public getEntity({ entityUuid }: EntityPath): ServerEntity {
		let entity: ServerEntity | undefined = this.entities.get(entityUuid);
		// Default clientEntity is always there
		return entity === undefined ? (this.entities.get(this.defaultEntityUuid) as ServerEntity) : entity;
	}

	/**
	 * Removes [[CommsEntity]].
	 */
	public removeEntity(path: EntityPath): void {
		if (path.entityUuid !== this.defaultEntityUuid) {
			this.doRemoveEntity(path);
		}
	}

	/**
	 * Terminate `this`.
	 */
	public terminate(): void {
		this.entities.forEach(serverEntity => {
			this.doRemoveEntity(serverEntity);
		});
	}

	/**
	 * Actually removes [[CommsEntity]].
	 */
	private doRemoveEntity({ entityUuid }: EntityPath): void {
		let serverEntity: ServerEntity | undefined = this.entities.get(entityUuid);
		if (serverEntity !== undefined) {
			serverEntity.terminate();
		}
	}
}
