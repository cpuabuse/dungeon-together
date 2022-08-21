/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for application with a shared state.
 */

import { Uuid } from "../common/uuid";
import { CoreState } from "./state";
import { CoreUniverseClassNonRecursive, CoreUniverseInstanceNonRecursive, universeNamespace } from "./universe";
import { coreGenerateUuid } from "./uuid";

/**
 * An application, to be extended.
 */
export class Application {
	/**
	 * Shared universe state.
	 */
	public state: CoreState = new CoreState();

	/**
	 * Static state.
	 */
	public static state: CoreState = new CoreState();

	/**
	 * Universes array.
	 */
	private universes: Map<Uuid, CoreUniverseInstanceNonRecursive> = new Map();

	/**
	 * Adds the universe to the application.
	 *
	 * @param param - Destructured parameter
	 * @returns Created universe
	 */
	public addUniverse<U extends CoreUniverseInstanceNonRecursive, R extends any[]>({
		args,
		Universe
	}: {
		/**
		 * Array for rest elements in the constructor of the universe.
		 */
		args: R;

		/**
		 * Universe class.
		 */
		Universe: CoreUniverseClassNonRecursive<U, R>;
	}): U {
		let universeUuid: Uuid = coreGenerateUuid({ namespace: universeNamespace, path: this.universes.size.toString() });
		let universe: U = new Universe({ application: this, universeUuid }, ...args);
		this.universes.set(universeUuid, universe);

		return universe;
	}
}
