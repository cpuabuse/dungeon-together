/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity within cells.
 */

import { FromAbstract } from "../common/utility-types";
import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { CellPathExtended } from "../core/cell";
import { CoreEntityArg, CoreEntityArgParentIds, CoreEntityClassFactory, EntityPathExtended } from "../core/entity";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "./base";
import { ServerCell } from "./cell";
import { ServerOptions, serverOptions } from "./options";

/**
 * Generator for the server entity class.
 *
 * @param param - Destructured parameter
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
	class ServerEntity extends CoreEntityClassFactory<ServerBaseClass, ServerBaseConstructorParams, ServerOptions>({
		Base,
		options: serverOptions
	}) {
		public kind: unknown;

		/**
		 * Kinds.
		 */
		private static kinds: Map<Uuid, unknown> = new Map();

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[entity, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ServerBaseConstructorParams,
				CoreEntityArg<ServerOptions>,
				CoreArgIds.Entity,
				ServerOptions,
				CoreEntityArgParentIds
			>
		) {
			// Call super constructor
			super(entity, { attachHook, created }, baseParams);
		}

		/**
		 * Move.
		 *
		 * @param entityPath - Path to entity
		 */
		public swapEntity(entityPath: EntityPathExtended): void {
			let entity: ServerEntity = ServerEntity.universe.getEntity(entityPath);

			this.performSwap(entityPath);
		}

		/**
		 * Actually moves the server cell.
		 *
		 * @param cellPath - Path to cell
		 */
		protected doMove(cellPath: CellPathExtended): void {
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
		protected doSwap(entityPath: EntityPathExtended): void {
			// Get thing while nothing is changed yet
			let targetEntity: ServerEntity = this.universe.getEntity(entityPath);
			let targetCellPath: CellPathExtended = { ...entityPath };

			// Set target path
			targetEntity.doMove(this);
			this.doMove(targetCellPath);
		}
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
 * Server entity class.
 */
export type ServerEntityClass = ReturnType<typeof ServerEntityFactory>;

/**
 * Generator for the server default entity class.
 *
 * @param param
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
		protected performMove(cellPath: CellPathExtended): void {
			this.doMove(cellPath);
		}

		/**
		 * Performs the swap of 2 [[ServerEntity]].
		 *
		 * To be overridden by extending classes.
		 *
		 * @param entityPath - Path to entity
		 */
		protected performSwap(entityPath: EntityPathExtended): void {
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
