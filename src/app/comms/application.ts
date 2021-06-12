/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for application with a shared state.
 */

import { DestructureParameters } from "../common/utility-types";
import { CoreState } from "./state";
import { CoreUniverse, CoreUniverseClassStatic } from "./universe";

/**
 * An application, to be extended.
 */
export class Application {
	/**
	 * Shared universe state.
	 */
	public state: CoreState = new CoreState();

	/**
	 * Universes array.
	 */
	private universes: Array<CoreUniverse> = new Array<CoreUniverse>();

	/**
	 * Adds the universe to the application.
	 *
	 * @returns Created universe
	 */
	public async addUniverse<C extends CoreUniverseClassStatic<InstanceType<C>>>({
		args,
		Universe
	}: keyof DestructureParameters<C> extends "application"
		? {
				/**
				 * Constructor args.
				 */
				args?: Record<"string", never>;

				/**
				 * Universe class.
				 */
				Universe: C;
		  }
		: {
				/**
				 * Constructor args.
				 */
				args: Omit<DestructureParameters<C>, "application">;

				/**
				 * Universe.
				 */
				Universe: C;
		  }): Promise<InstanceType<C>> {
		let universe: InstanceType<C> = new Universe({ application: this, ...args });
		this.universes.push(universe);
		// TS will infer the type of resolve parameter from generic
		// eslint-disable-next-line @typescript-eslint/typedef
		return new Promise<InstanceType<C>>(function (resolve) {
			setTimeout(function () {
				resolve(universe);
			});
		});
	}
}
