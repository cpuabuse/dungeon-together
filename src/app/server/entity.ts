/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Occupant of cells.
 */

import { CommsEntity, CommsEntityArgs, EntityPath } from "../comms/entity";
import { CellPath } from "../comms/cell";
import { ServerCell } from "./cell";
import { ServerProto } from "./proto";
import { Uuid } from "../common/uuid";
import { defaultModeUuid } from "../common/defaults";

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
 * The server entity itself. Can be anything that resides within the [[Cell]].
 *
 * It is a responsibility of the classes extending [[ServerEntity]] to perform consistency checks on the arguments, thus the default values should always be provided.
 *
 * There are 2 ways to create a [[ServerEntity]]:
 *
 * // TODO: Add ways to create a thing
 */
export abstract class ServerEntity extends ServerProto implements CommsEntity {
	/**
	 * Kind of this server entity in the world.
	 */
	public kindUuid: Uuid;

	/**
	 * Mode of the server entity.
	 */
	public modeUuid: string = defaultModeUuid;

	/**
	 * Cell occupied by the server entity.
	 */
	public cellUuid: Uuid;

	/**
	 * Universe this resides in.
	 */
	public shardUuid: Uuid;

	/**
	 * Corresponding grid.
	 */
	public gridUuid: Uuid;

	/**
	 * This UUID.
	 */
	public entityUuid: Uuid;

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
	 */
	public move(cellPath: CellPath): void {
		this.performMove(cellPath);
	}

	/**
	 * Move.
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
	 * Actually moves the server cell.
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
	 * Performs actual initialization.
	 *
	 * To be overriden by extending classes.
	 */
	protected abstract doInitialize(): void;

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
	 * To be overriden by extending classes.
	 *
	 * Should call [[doSwap]].
	 */
	protected abstract performSwap(entityPath: EntityPath): void;
}

/**
 * [[ServerEntity]] created by default.
 *
 * Not to be used.
 */
export class DefaultEntity extends ServerEntity {
	// No additional processing for a dummy class
	/**
	 * Performs actual initialization.
	 *
	 * To be overriden by extending classes.
	 */
	protected doInitialize(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

	// No additional processing for a dummy class
	/**
	 * Performs necessary cleanup.
	 */
	protected doTerminate(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

	/**
	 * Moves to another location.
	 */
	protected performMove(cellPath: CellPath): void {
		this.doMove(cellPath);
	}

	/**
	 * Performs the swap of 2 [[ServerEntity]].
	 *
	 * To be overriden by extending classes.
	 */
	protected performSwap(entityPath: EntityPath): void {
		this.doSwap(entityPath);
	}
}
