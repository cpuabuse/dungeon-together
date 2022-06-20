/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Base object prototype for client
 */

import { ReplaceConcreteConstructorParameters, StaticImplements } from "../common/utility-types";
import { CoreBaseClassNonRecursive } from "../core/base";
import { ClientUniverse } from "./universe";

/**
 * Generates universe objet base class.
 *
 * @param param - Destructured parameters
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
	 * Client implementation of base.
	 */
	// Have to merge interfaces to modify prototype
	// eslint-disable-next-line no-redeclare
	class ClientBase implements StaticImplements<CoreBaseClassNonRecursive, typeof ClientBase> {
		/**
		 * Client universe.
		 */
		public static universe: ClientUniverse = universe;

		/**
		 * Universe container.
		 */
		public static universeElement: HTMLElement = element;

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

	return ClientBase;
}

/**
 * Real base ctor params.
 */
export type ClientBaseConstructorParams = [];

/**
 * A type for client proto class.
 */
export type ClientBaseClass = ReturnType<typeof ClientBaseFactory>;

/**
 * A type for client proto instance.
 */
export type ClientBaseInstance = InstanceType<ClientBaseClass>;
