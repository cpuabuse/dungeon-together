/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity within cells.
 */

import { Uuid } from "../../common/uuid";
import { CoreArgIds } from "../../core/arg";
import { CellPathExtended } from "../../core/cell";
import { CoreEntityArg, CoreEntityArgParentIds, CoreEntityClassFactory, EntityPathExtended } from "../../core/entity";
import { CoreUniverseObjectConstructorParameters } from "../../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "../base";
import { ServerCell } from "../cell";
import { ServerOptions, serverOptions } from "../options";
import { DefaultEntityKindClassFactory } from "./default-entity";
import { EntityKind, EntityKindClassConcrete } from "./entity-kind";

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
		private static DefaultKind: EntityKindClassConcrete = DefaultEntityKindClassFactory({ Base: EntityKind });

		private kind: EntityKind;

		/**
		 * Kinds, also generate default kind.
		 */
		private static kinds: Map<Uuid, EntityKindClassConcrete> = new Map([]);

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

			// Initialize kind
			this.kind = new (ServerEntity.kinds.get(this.kindUuid) ?? ServerEntity.DefaultKind)({ entity: this });

			// On attach
			attachHook
				.then(() => {
					this.kind.onCreateEntity();
				})
				.catch(() => {
					// TODO: Process error
				});
		}

		/**
		 * Actually moves the server cell.
		 *
		 * @param cellPath - Path to cell
		 */
		public moveEntity(cellPath: CellPathExtended): void {
			// Get server cell for accurate UUIDs
			let cell: ServerCell = ServerEntity.universe.getCell(cellPath);

			// Reattach
			ServerEntity.universe.getCell(this).detachEntity(this);
			this.shardUuid = cell.shardUuid;
			this.gridUuid = cell.gridUuid;
			this.cellUuid = cell.cellUuid;
			cell.attach(this);
		}

		/**
		 * Move.
		 *
		 * @param entityPath - Path to entity
		 */
		public swapEntity(entityPath: EntityPathExtended): void {
			// Get thing while nothing is changed yet
			let targetEntity: ServerEntity = ServerEntity.universe.getEntity(entityPath);
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
export type ServerEntityClass = ReturnType<typeof ServerEntityFactory>;

/**
 * Instance type of server entity.
 */
export type ServerEntity = InstanceType<ServerEntityClass>;
