/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cells on screen.
 */

import { CoreArgIds } from "../core/arg";
import { CellPathOwn } from "../core/cell";
import { CoreGridArg, CoreGridClassFactory } from "../core/grid";
import { CoreGridArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientCell } from "./cell";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard } from "./shard";

/**
 * Generator for the client grid class.
 *
 * @param param - Destructured parameter
 * @returns Client grid class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientGridClassFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * Vector Array Object.
	 */
	class ClientGrid extends CoreGridClassFactory<
		ClientBaseClass,
		ClientBaseConstructorParams,
		ClientOptions,
		ClientCell
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
		 * Constructor.
		 *
		 * @param param - Destructure parameter
		 */
		public constructor(
			// ESLint bug - nested args
			// eslint-disable-next-line @typescript-eslint/typedef
			...[grid, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ClientBaseConstructorParams,
				CoreGridArg<ClientOptions>,
				CoreArgIds.Grid,
				ClientOptions,
				CoreGridArgParentIds
			>
		) {
			super(grid, { attachHook, created }, baseParams);
		}

		/**
		 * Hides cell.
		 *
		 * @param path - Target cell path
		 */
		public hideCell(path: CellPathOwn): void {
			let cell: ClientCell = this.getCell(path);

			// Not deferred for performance
			cell.entities.forEach(entity => {
				cell.hideEntity(entity);
			});
			cell.shard = undefined;
		}

		/**
		 * Shows cell.
		 *
		 * @remarks
		 * Should usually be called within `setTimeout`.
		 *
		 * @param path - Target cell path
		 */
		public showCell(path: CellPathOwn): void {
			let cell: ClientCell = this.getCell(path);

			// Bind to shard
			cell.shard = this.shard;

			// Post-attach (decoration); Not deferred to process a cell at time, for performance
			cell.entities.forEach(entity => {
				cell.showEntity(entity);
			});
		}
	}

	/**
	 * Attaches client cell.
	 *
	 * @param this - Client grid
	 * @param cell - Cell
	 */
	ClientGrid.prototype.attachCell = function (this: ClientGrid, cell: ClientCell): void {
		// Super first
		(Object.getPrototypeOf(ClientGrid.prototype) as ClientGrid).attachCell.call(this, cell);

		ClientGrid.universe.universeQueue.addCallback({
			/**
			 * Callback.
			 */
			callback: () => {
				this.showCell(cell);
			}
		});
	};

	/**
	 * Detaches client cell.
	 *
	 * @param this - Client grid
	 * @param path - Cell path
	 */
	ClientGrid.prototype.detachCell = function (this: ClientGrid, path: CellPathOwn): void {
		// Hide queued first, just for semantical order
		ClientGrid.universe.universeQueue.addCallback({
			/**
			 * Callback.
			 */
			callback: () => {
				this.hideCell(path);
			}
		});

		// Super last
		(Object.getPrototypeOf(ClientGrid.prototype) as ClientGrid).detachCell(path);
	};

	// Return the class
	return ClientGrid;
}

/**
 * Type of client grid class.
 */
export type ClientGridClass = ReturnType<typeof ClientGridClassFactory>;

/**
 * Instance type of client grid.
 */
export type ClientGrid = InstanceType<ClientGridClass>;
