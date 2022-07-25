/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Cells making up the grid.
 */

import { CoreArgIds } from "../core/arg";
import { CoreCellArg, CoreCellClassFactory } from "../core/cell";
import { CoreCellArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "./base";
import { ServerEntity } from "./entity";
import { ServerOptions, serverOptions } from "./options";

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
	}

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
