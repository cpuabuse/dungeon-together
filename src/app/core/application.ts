/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for application with a shared state.
 */

import { UrlPath, separator } from "../common/url";
import { Uuid } from "../common/uuid";
import { CoreState } from "./state";
import { CoreUniverseClassNonRecursive, CoreUniverseInstanceNonRecursive, universeNamespace } from "./universe";
import { coreGenerateUuid } from "./uuid";

/**
 * Unique universe identifier.
 */
// eslint-disable-next-line @typescript-eslint/typedef
export const applicationNamespace = "universe" as const;

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
	 * Application path.
	 */
	private path: UrlPath;

	/**
	 * Universes array.
	 */
	private universes: Map<Uuid, CoreUniverseInstanceNonRecursive> = new Map();

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		path
	}: {
		/**
		 * Application path.
		 */
		path: UrlPath;
	}) {
		this.path = path;
	}

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
		let universeUuid: Uuid = coreGenerateUuid({
			namespace: universeNamespace,
			// For path - `{{ unique_pool }}/{{ unique_universe }}`
			path: `${this.path}${separator}$this.universes.size.toString()`
		});
		let universe: U = new Universe({ application: this, universeUuid }, ...args);
		this.universes.set(universeUuid, universe);

		return universe;
	}
}
