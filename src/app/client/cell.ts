/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Squares on screen.
 */

import { CoreArgIds } from "../core/arg";
import { CoreCellArg, CoreCellArgParentIds, CoreCellClassFactory } from "../core/cell";
import { EntityPathOwn } from "../core/entity";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientEntity } from "./entity";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard } from "./shard";

/**
 * Generator for the client cell class.
 *
 * @param param - Destructured parameter
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
	class ClientCell extends CoreCellClassFactory<
		ClientBaseClass,
		ClientBaseConstructorParams,
		ClientOptions,
		ClientEntity
	>({
		Base,
		options: clientOptions
	}) {
		/**
		 * Parent shard.
		 *
		 * @remarks
		 * This member's purpose is not to contain a shard. It is just a symbolic replacement (for simplicity) for client specific properties, that shard contains, like container(canvas).
		 */
		public shard?: ClientShard;

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Public constructor.
		 *
		 * @param param - Destructure parameter
		 */
		public constructor(
			// ESLint bug - nested args
			// eslint-disable-next-line @typescript-eslint/typedef
			...[cell, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ClientBaseConstructorParams,
				CoreCellArg<ClientOptions>,
				CoreArgIds.Cell,
				ClientOptions,
				CoreCellArgParentIds
			>
		) {
			super(cell, { attachHook, created }, baseParams);
		}

		/**
		 * Stops display of entity in canvas.
		 *
		 * @param path - Client entity path
		 * @see {@link ClientCell.showEntity}
		 */
		public hideEntity(path: EntityPathOwn): void {
			let entity: ClientEntity = this.getEntity(path);
			this.shard?.gridContainer.removeChild(entity.sprite);
			entity.sprite.stop();
		}

		/**
		 * Displays entity appropriately.
		 * Changes canvas state in relation to the state of the entity.
		 *
		 * @param path - Client entity path
		 * @remarks
		 * During the initialization, the decorate will not be run as part of attach cell function, since no entity would be attached yet. This results in decorate function running only once, from attach entity function.
		 *
		 * Should usually be called within `setTimeout`.
		 */
		public showEntity(path: EntityPathOwn): void {
			let entity: ClientEntity = this.getEntity(path);

			const sceneWidth: number = this.shard?.sceneWidth ?? 0;
			const sceneHeight: number = this.shard?.sceneHeight ?? 0;

			// Update entity position, do it before adding to container, to avoid jumps on screen
			entity.sprite.x = sceneWidth * this.x;
			entity.sprite.y = sceneHeight * this.y;
			entity.sprite.height = sceneWidth;
			entity.sprite.width = sceneHeight;

			// Register entity to canvas
			this.shard?.gridContainer.addChild(entity.sprite);
			entity.sprite.play();
		}
	}

	/**
	 * Attaches client entity.
	 *
	 * @param this - Client cell
	 * @param entity - Entity
	 */
	ClientCell.prototype.attachEntity = function (this: ClientCell, entity: ClientEntity): void {
		// Super first
		(Object.getPrototypeOf(ClientCell.prototype) as ClientCell).attachEntity(entity);

		// Post-attach (decoration)
		ClientCell.universe.universeQueue.addCallback({
			/**
			 * Callback.
			 */
			callback: () => {
				this.showEntity(entity);
			}
		});
	};

	/**
	 * Attaches client entity.
	 *
	 * @param this - Client cell
	 * @param path - Entity path
	 */
	ClientCell.prototype.detachEntity = function (this: ClientCell, path: EntityPathOwn): void {
		// Queued first for semantical order
		ClientCell.universe.universeQueue.addCallback({
			/**
			 * Callback.
			 */
			callback: () => {
				this.hideEntity(path);
			}
		});

		// Super last
		(Object.getPrototypeOf(ClientCell.prototype) as ClientCell).detachEntity(path);
	};

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
