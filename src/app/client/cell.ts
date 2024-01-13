/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Squares on screen.
 */

import { GlowFilter } from "@pixi/filter-glow";
import { ColorMatrixFilter, Container, type Filter } from "pixi.js";
import { CoreArgIds } from "../core/arg";
import { CoreCellArg, CoreCellClassFactory } from "../core/cell";
import { EntityPathOwn } from "../core/entity";
import { CoreCellArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientEntity } from "./entity";
import { ClientOptions, clientOptions } from "./options";
import { ClientShard } from "./shard";

/**
 * Burn.
 */
const contrastFilter: ColorMatrixFilter = new ColorMatrixFilter();
contrastFilter.contrast(2, false);

/**
 * Identifiers of filters.
 */
// Force infer the type
// eslint-disable-next-line @typescript-eslint/typedef
const filterNames = ["contrast", "glow"] as const;

/**
 * Filter name.
 */
type FilterName = (typeof filterNames)[number];

/**
 * Map of filter names to actual filters.
 */
const filterMap: {
	[Key in FilterName]: Filter;
} = {
	contrast: contrastFilter,
	glow: new GlowFilter({
		innerStrength: 2,
		outerStrength: 0
	})
};

/**
 * Filter state.
 */
type FilterState = {
	[Key in FilterName]: boolean;
};

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
		/** Cell owned display container. */
		public container: Container = new Container();

		/**
		 * Parent shard.
		 *
		 * @remarks
		 * This member's purpose is not to contain a shard. It is just a symbolic replacement (for simplicity) for client specific properties, that shard contains, like container(canvas).
		 */
		public shard?: ClientShard;

		/**
		 * Dynamically generates filters.
		 *
		 * @returns Array of filters
		 */
		public get filters(): Array<Filter> {
			return (
				Object.entries(this.filterState)
					// ESLint does not pick up types
					// eslint-disable-next-line @typescript-eslint/typedef
					.filter(([, isEnabled]) => {
						return isEnabled;
					})
					// ESLint does not pick up types
					// eslint-disable-next-line @typescript-eslint/typedef
					.map(([name]) => {
						return filterMap[name as FilterName];
					})
			);
		}

		protected filterState: FilterState = filterNames.reduce((result, name) => {
			return {
				...result,
				[name]: false
			};
		}, {} as FilterState);

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

			// Fog
			this.setFilters({
				contrast: true
			});
		}

		/**
		 * Stops display of entity in canvas.
		 *
		 * @param path - Client entity path
		 * @see {@link ClientCell.showEntity}
		 */
		public hideEntity(path: EntityPathOwn): void {
			let entity: ClientEntity = this.getEntity(path);
			if (entity.isInUniverse) {
				this.container.removeChild(entity.container);
				entity.sprite.stop();
			}
		}

		/**
		 * Remove or add filters to the cell.
		 *
		 * @param filterState - Object with list of filter states to change
		 */
		public setFilters(filterState: Partial<FilterState>): void {
			// ESLint does not pick up types
			// eslint-disable-next-line @typescript-eslint/typedef
			Object.entries(filterState).forEach(([name, isEnabled]) => {
				// Make sure that the value is a boolean and not undefined, as it might have still be passed via partial argument; Then only work with keys that are valid filter names
				if (
					typeof isEnabled === "boolean" &&
					(filterNames.includes as (filterName: string) => filterName is FilterName)(name)
				) {
					this.filterState[name] = isEnabled;
				}
			});

			// Set filters
			this.container.filters = this.filters;
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
			if (entity.isInUniverse) {
				const sceneWidth: number = this.shard?.sceneWidth ?? 0;
				const sceneHeight: number = this.shard?.sceneHeight ?? 0;

				entity.sprite.height = sceneWidth;
				entity.sprite.width = sceneHeight;

				// Register entity to canvas
				this.container.addChild(entity.container);
				entity.sprite.play();
			}
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
		(Object.getPrototypeOf(ClientCell.prototype) as ClientCell).attachEntity.call(this, entity);

		entity.isInUniverse = true;

		// Post-attach (decoration)
		this.showEntity(entity);
	};

	/**
	 * Detaches client entity.
	 *
	 * @param this - Client cell
	 * @param path - Entity path
	 */
	ClientCell.prototype.detachEntity = function (this: ClientCell, path: EntityPathOwn): void {
		// Hide first
		this.hideEntity(path);

		// Super last
		(Object.getPrototypeOf(ClientCell.prototype) as ClientCell).detachEntity.call(this, path);
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
