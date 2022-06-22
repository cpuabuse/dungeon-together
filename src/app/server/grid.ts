/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Grid for the dungeons.
 */

import { CoreArgIds } from "../core/arg";
import { CoreGridArg, CoreGridArgParentIds, CoreGridClassFactory } from "../core/grid";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "./base";
import { ServerCell } from "./cell";
import { ServerOptions, serverOptions } from "./options";

/**
 * Generator for the server grid class.
 *
 * @param param - Destructured parameter
 * @returns Server grid class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerGridFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * The grid itself.
	 */
	class ServerGrid extends CoreGridClassFactory<
		ServerBaseClass,
		ServerBaseConstructorParams,
		ServerOptions,
		ServerCell
	>({
		Base,
		options: serverOptions
	}) {
		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Initializes the server grid.
		 *
		 * @param param - Destructured parameters
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[grid, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ServerBaseConstructorParams,
				CoreGridArg<ServerOptions>,
				CoreArgIds.Grid,
				ServerOptions,
				CoreGridArgParentIds
			>
		) {
			// Super
			super(grid, { attachHook, created }, baseParams);
		}
	}

	// Return class
	return ServerGrid;
}

/**
 * Type of server grid class.
 */
export type ServerGridClass = ReturnType<typeof ServerGridFactory>;

/**
 * Instance type of server grid.
 */
export type ServerGrid = InstanceType<ServerGridClass>;
