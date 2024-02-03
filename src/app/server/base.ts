/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Base object prototype for server
 */

import { StaticImplements } from "../common/utility-types";
import { CoreBaseClassNonRecursive } from "../core/base";
import { ServerUniverse } from "./universe";

/**
 * Generates universe objet base class.
 *
 * @param param - Destructured parameters
 * @returns Server universe class
 */
// Force type inference to extract class
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerBaseFactory({
	universe
}: {
	/**
	 * Server universe.
	 */
	universe: ServerUniverse;
}) {
	/**
	 * Merging prototype.
	 */
	class ServerBase implements StaticImplements<CoreBaseClassNonRecursive, typeof ServerBase> {
		/**
		 * A universe instance.
		 */
		public static universe: ServerUniverse = universe;

		/**
		 * Constructor.
		 *
		 * @param args - Base constructor params must be explicitly `any[]` for appropriate extension of core universe object classes
		 */
		// eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-unused-vars
		public constructor(...args: any[]) {
			// Nothing
		}
	}

	return ServerBase;
}

/**
 * Real base ctor params.
 */
export type ServerBaseConstructorParams = [];

/**
 * A type for server proto class.
 */
export type ServerBaseClass = ReturnType<typeof ServerBaseFactory>;

/**
 * A type for server proto instance.
 */
export type ServerBase = InstanceType<ServerBaseClass>;
