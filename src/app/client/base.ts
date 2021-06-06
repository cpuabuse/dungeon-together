/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Base object prototype for client
 */

import { CoreBase } from "../comms/base";
import { ClientUniverse } from "./universe";

/**
 * Generates universe objet base class.
 *
 * @returns Client universe class
 */
// Force type inference to extract class
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientBaseFactory({
	element,
	universe
}: {
	/**
	 * Client universe.
	 */
	universe: ClientUniverse;

	/**
	 * Universe container.
	 */
	element: HTMLElement;
}) {
	/**
	 * Merging prototype.
	 */
	// Interface should be same name as class to merge
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface ClientBase extends CoreBase {
		/**
		 * A universe instance.
		 */
		universe: ClientUniverse;

		/**
		 * Universe container.
		 */
		element: HTMLElement;
	}

	/**
	 * Client implementation of base.
	 */
	// Have to merge interfaces to modify prototype
	// eslint-disable-next-line no-redeclare
	class ClientBase {}

	// Assign prototype
	ClientBase.prototype.universe = universe;
	ClientBase.prototype.element = element;

	return ClientBase;
}

/**
 * A type for client proto class.
 */
export type ClientBaseClass = ReturnType<typeof ClientBaseFactory>;

/**
 * A type for client proto instance.
 */
export type ClientBase = InstanceType<ClientBaseClass>;
