/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cells making up the grid.
 */

import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { CoreCellArg, CoreCellClassFactory } from "../core/cell";
import { EntityPathExtended } from "../core/entity";
import { CoreCellArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "./base";
import { ServerEntity } from "./entity";
import { ServerOptions, serverOptions } from "./options";

/**
 * Cell event.
 */
export type CellEvent =
	| {
			/**
			 * Death type.
			 */
			name: "death";

			/**
			 * Target entity UUID.
			 */
			targetEntityUuid: Uuid;
	  }
	| {
			/**
			 * Trail type.
			 */
			name: "trail";

			/**
			 * Target entity UUID.
			 */
			targetEntityUuid: Uuid;

			/**
			 * Target cell UUID.
			 */
			targetCellUuid: Uuid;
	  };

/**
 * Generator for the server cell class.
 *
 * @param param - Destructured parameter
 * @returns Server cell class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerCellFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * The cell within the grid.
	 */
	class ServerCell extends CoreCellClassFactory<
		ServerBaseClass,
		ServerBaseConstructorParams,
		ServerOptions,
		ServerEntity
	>({
		Base,
		options: serverOptions
	}) {
		/** Cell events. */
		public events: Array<CellEvent> = new Array<CellEvent>();

		/**
		 * Whether the cell has been updated.
		 * Should be updated by kind only when kind specific information must be sent to the client.
		 */
		public isUpdated: boolean = false;

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Cell constructor.
		 *
		 * Creates nowhere by default.
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[cell, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ServerBaseConstructorParams,
				CoreCellArg<ServerOptions>,
				CoreArgIds.Cell,
				ServerOptions,
				CoreCellArgParentIds
			>
		) {
			// Super
			super(cell, { attachHook, created }, baseParams);
		}

		/**
		 * Adds an event to the cell, and flags cell as updated.
		 *
		 * @param event - Event to add
		 */
		public addEvent(event: CellEvent): void {
			this.events.push(event);
			this.isUpdated = true;
		}

		/**
		 * Clears cell events and other things.
		 */
		public clear(): void {
			this.events = new Array<CellEvent>();
		}
	}

	/**
	 * Detaches server entity.
	 *
	 * @param this - Server cell
	 * @param path - Entity path
	 */
	ServerCell.prototype.detachEntity = function (this: ServerCell, path: EntityPathExtended): void {
		let entityToDetach: ServerEntity = this.getEntity(path);

		// Notify other entities in cell; Done first so that other entities can locate the entity
		this.entities.forEach(entityToNotify => {
			// Skip this entity because it will be notified separately, and it is still not detached
			if (entityToNotify.entityUuid !== entityToDetach.entityUuid) {
				entityToNotify.kind.onCellDetachEntity(entityToDetach);
			}
		});

		// Notify entity itself of detachment
		entityToDetach.kind.onDetachEntity();

		// Super last
		(Object.getPrototypeOf(ServerCell.prototype) as ServerCell).detachEntity.call(this, path);
	};

	/**
	 * Attaches server entity.
	 *
	 * @param this - Server cell
	 * @param path - Entity path
	 * @param entityToAttach - Entity to attach
	 */
	ServerCell.prototype.attachEntity = function (this: ServerCell, entityToAttach: ServerEntity): void {
		// Super first
		(Object.getPrototypeOf(ServerCell.prototype) as ServerCell).attachEntity.call(this, entityToAttach);

		// Notify entity itself of attachment
		entityToAttach.kind.onAttachEntity();

		// Notify other entities in cell
		this.entities.forEach(entityToNotify => {
			// Skip this entity because it will be notified separately
			if (entityToNotify.entityUuid !== entityToAttach.entityUuid) {
				entityToNotify.kind.onCellAttachEntity(entityToAttach);
			}
		});
	};

	// Return class
	return ServerCell;
}

/**
 * Type of server shard class.
 */
export type ServerCellClass = ReturnType<typeof ServerCellFactory>;

/**
 * Instance type of server shard.
 */
export type ServerCell = InstanceType<ServerCellClass>;
