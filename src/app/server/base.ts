/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Base object prototype for server
 */

import { CoreBase } from "../core/base";
import { ServerUniverse } from "./universe";

/**
 * Generates universe objet base class.
 *
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
	// Interface should be same name as class to merge
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface ServerBase extends CoreBase {
		/**
		 * A universe instance.
		 */
		universe: ServerUniverse;
	}

	/**
	 * Server implementation of base.
	 */
	// Have to merge interfaces to modify prototype
	// eslint-disable-next-line no-redeclare
	class ServerBase {}

	// Assign prototype
	ServerBase.prototype.universe = universe;

	return ServerBase;
}

/**
 * A type for server proto class.
 */
export type ServerBaseClass = ReturnType<typeof ServerBaseFactory>;

/**
 * A type for server proto instance.
 */
export type ServerBase = InstanceType<ServerBaseClass>;
