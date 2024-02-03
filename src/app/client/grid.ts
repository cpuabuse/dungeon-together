/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cells on screen.
 */

import { Container } from "pixi.js";
import { CoreArgIds } from "../core/arg";
import { CellPathOwn } from "../core/cell";
import { LogLevel } from "../core/error";
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
		 * Display of current level.
		 */
		public currentLevel: number = 0;

		/**
		 * An array of containers sorted by the depth.
		 */
		public levelIndex: Array<Container>;

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

			// Initialize zIndex
			this.levelIndex = Array.from(new Array(this.zLength), () => {
				let container: Container = new Container();
				container.visible = false;
				return container;
			});

			// Make only the surface level visible
			let firstLevel: Container | undefined = this.levelIndex[0];
			if (firstLevel) {
				firstLevel.visible = true;
			} else {
				(this.constructor as typeof ClientGrid).universe.log({
					error: new Error("Levels not initialized"),
					level: LogLevel.Alert
				});
			}
		}

		/**
		 * Change level visibility.
		 *
		 * @param param - Change level
		 */
		public changeLevel({
			level
		}: {
			/**
			 * Target level.
			 */
			level: number;
		}): void {
			if (level < this.zLength && level >= 0 && this.currentLevel !== level) {
				// Enable visibility first to avoid blank screen
				let levelContainer: Container | undefined = this.levelIndex[level];
				let thisLevelContainer: Container | undefined = this.levelIndex[this.currentLevel];
				if (levelContainer && thisLevelContainer) {
					levelContainer.visible = true;
					thisLevelContainer.visible = false;
					this.currentLevel = level;
					(this.constructor as ClientGridClass).universe.stores.useUniverseStore().updateGridLevel();
				} else {
					(this.constructor as typeof ClientGrid).universe.log({
						error: new Error("Levels not initialized"),
						level: LogLevel.Alert
					});
				}
			}
		}

		/**
		 * Hides cell.
		 *
		 * @param path - Target cell path
		 */
		public hideCell(path: CellPathOwn): void {
			let cell: ClientCell = this.getCell(path);

			// Remove container
			let levelContainer: Container | undefined = this.levelIndex[cell.z];
			if (levelContainer) {
				levelContainer.removeChild(cell.container);
			} else {
				(this.constructor as typeof ClientGrid).universe.log({
					error: new Error("Could not find cell container"),
					level: LogLevel.Error
				});
			}

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

			// Update cell container position, do it before adding to grid container, to avoid jumps on screen
			const sceneWidth: number = this.shard?.sceneWidth ?? 0;
			const sceneHeight: number = this.shard?.sceneHeight ?? 0;
			cell.container.x = sceneWidth * cell.x;
			cell.container.y = sceneHeight * cell.y;

			// Add container
			let levelContainer: Container | undefined = this.levelIndex[cell.z];
			if (levelContainer) {
				levelContainer.addChild(cell.container);
			} else {
				(this.constructor as typeof ClientGrid).universe.log({
					error: new Error("Could not find cell container"),
					level: LogLevel.Error
				});
			}

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

		this.showCell(cell);
	};

	/**
	 * Detaches client cell.
	 *
	 * @param this - Client grid
	 * @param path - Cell path
	 */
	ClientGrid.prototype.detachCell = function (this: ClientGrid, path: CellPathOwn): void {
		// Hide queued first
		this.hideCell(path);

		// Super last
		(Object.getPrototypeOf(ClientGrid.prototype) as ClientGrid).detachCell.call(this, path);
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
