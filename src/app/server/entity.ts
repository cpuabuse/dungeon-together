/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity within cells.
 */

import { defaultModeUuid } from "../common/defaults";
import { FromAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CellPath } from "../comms/cell";
import { CommsEntity, CommsEntityArgs, EntityPath } from "../comms/entity";
import { ServerBaseClass } from "./base";
import { ServerCell } from "./cell";

/**
 * Arguments for constructor of a server entity.
 */
export interface InitializeArgs extends CellPath {
	/**
	 * Kind of server entity in world.
	 */
	kindUuid: Uuid;

	/**
	 * The whole world
	 */
	worldUuid: Uuid;
}

/**
 * Arguments for a [[ServerEntity]].
 */
export interface ServerEntityArgs extends CommsEntityArgs {
	[key: string]: any;
}

/**
 * Generator for the server entity class.
 *
 * @returns Server entity class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerEntityFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * The server entity itself. Can be anything that resides within the [[Cell]].
	 *
	 * It is a responsibility of the classes extending [[ServerEntity]] to perform consistency checks on the arguments, thus the default values should always be provided.
	 *
	 * There are 2 ways to create a [[ServerEntity]]:
	 *
	 * // TODO: Add ways to create a thing
	 */
	abstract class ServerEntity extends Base implements CommsEntity {
		/**
		 * Cell occupied by the server entity.
		 */
		public cellUuid: Uuid;

		/**
		 * This UUID.
		 */
		public entityUuid: Uuid;

		/**
		 * Corresponding grid.
		 */
		public gridUuid: Uuid;

		/**
		 * Kind of this server entity in the world.
		 */
		public kindUuid: Uuid;

		/**
		 * Mode of the server entity.
		 */
		public modeUuid: string = defaultModeUuid;

		/**
		 * Universe this resides in.
		 */
		public shardUuid: Uuid;

		/**
		 * World this is in.
		 */
		public worldUuid: Uuid;

		/**
		 * Constructor.
		 */
		public constructor({ shardUuid, kindUuid, cellUuid, gridUuid, entityUuid, worldUuid }: ServerEntityArgs) {
			// ServerProto
			super();

			// Set path
			this.shardUuid = shardUuid;
			this.gridUuid = gridUuid;
			this.cellUuid = cellUuid;
			this.entityUuid = entityUuid;

			// Set kind & world
			this.kindUuid = kindUuid;
			this.worldUuid = worldUuid;
		}

		/**
		 * Initializes the cell's server entities.
		 */
		public static initialize(
			// Fix the linting errors; This method is defined to provide type
			// eslint-disable-next-line no-empty-pattern
			{}: InitializeArgs
		): void {
			// Do nothing
		}

		/**
		 * Initializes the [[ServerEntity]] into the `ServerCell`.
		 *
		 * To be called from `ServerCell`.
		 */
		public initialize(): void {
			this.doInitialize();
			this.universe.getCell(this).attach(this);
		}

		/**
		 * Move.
		 *
		 * @param cellPath - Path to cell
		 */
		public move(cellPath: CellPath): void {
			this.performMove(cellPath);
		}

		/**
		 * Move.
		 *
		 * @param entityPath - Path to entity
		 */
		public swap(entityPath: EntityPath): void {
			let entity: ServerEntity = this.universe.getEntity(entityPath);
			if (entity.kindUuid === this.kindUuid && entity.worldUuid === this.worldUuid) {
				this.performSwap(entityPath);
			}
		}

		/**
		 * Terminates the [[ServerEntity]].
		 */
		public terminate(): void {
			this.universe.getCell(this).detach(this);
			this.doTerminate();
		}

		/**
		 * Performs actual initialization.
		 *
		 * To be overridden by extending classes.
		 */
		protected abstract doInitialize(): void;

		/**
		 * Actually moves the server cell.
		 *
		 * @param cellPath - Path to cell
		 */
		protected doMove(cellPath: CellPath): void {
			// Get server cell for accurate UUIDs
			let cell: ServerCell = this.universe.getCell(cellPath);

			// Reattach
			this.universe.getCell(this).detach(this);
			this.shardUuid = cell.shardUuid;
			this.gridUuid = cell.gridUuid;
			this.cellUuid = cell.cellUuid;
			cell.attach(this);
		}

		/**
		 * Swaps cells with a target server entity.
		 *
		 * @param entityPath - Path to entity
		 */
		protected doSwap(entityPath: EntityPath): void {
			// Get thing while nothing is changed yet
			let targetEntity: ServerEntity = this.universe.getEntity(entityPath);
			let targetCellPath: CellPath = { ...entityPath };

			// Set target path
			targetEntity.doMove(this);
			this.doMove(targetCellPath);
		}

		/**
		 * Performs necessary cleanup.
		 */
		protected abstract doTerminate(): void;

		/**
		 * Moves to another location.
		 *
		 * Should call [[doMove]].
		 */
		protected abstract performMove(cellPath: CellPath): void;

		/**
		 * Performs the swap of 2 [[ServerEntity]].
		 *
		 * To be overridden by extending classes.
		 *
		 * Should call [[doSwap]].
		 */
		protected abstract performSwap(entityPath: EntityPath): void;
	}

	// Return class
	return ServerEntity;
}

/**
 * Type of server entity class.
 */
export type ServerEntityClassOriginalAbstract = ReturnType<typeof ServerEntityFactory>;

/**
 * Type of server entity class.
 */
export type ServerEntityClassConcrete = FromAbstract<ServerEntityClassOriginalAbstract>;

/**
 * Instance type of server entity.
 */
export type ServerEntity = InstanceType<ServerEntityClassConcrete>;

/**
 * Generator for the server default entity class.
 *
 * @returns Default server entity class
 */
export function DefaultServerEntityFactory({
	Entity
}: {
	/**
	 * Server base.
	 */
	Entity: ServerEntityClassOriginalAbstract;
}): ServerEntityClassConcrete {
	/**
	 * [[ServerEntity]] created by default.
	 *
	 * Not to be used.
	 */
	class DefaultEntity extends Entity {
		// No additional processing for a dummy class
		/**
		 * Performs actual initialization.
		 *
		 * To be overridden by extending classes.
		 */
		protected doInitialize(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

		// No additional processing for a dummy class
		/**
		 * Performs necessary cleanup.
		 */
		protected doTerminate(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

		/**
		 * Moves to another location.
		 *
		 * @param cellPath - Path to cell
		 */
		protected performMove(cellPath: CellPath): void {
			this.doMove(cellPath);
		}

		/**
		 * Performs the swap of 2 [[ServerEntity]].
		 *
		 * To be overridden by extending classes.
		 *
		 * @param entityPath - Path to entity
		 */
		protected performSwap(entityPath: EntityPath): void {
			this.doSwap(entityPath);
		}
	}

	return DefaultEntity;
}

/**
 * Type of default server entity class.
 */
export type DefaultServerEntityClass = ReturnType<typeof DefaultServerEntityFactory>;

/**
 * Instance type of server entity.
 */
export type DefaultServerEntity = InstanceType<DefaultServerEntityClass>;
