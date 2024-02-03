/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vue module overrides.
 *
 * @remarks
 * To use `ComponentCustomProperties` must be a module to augument global properties, with `export {};`.
 *
 * @file
 */

import { Stores } from "./vue/core/store";

declare module "vue" {
	/**
	 * Injection override for stores resource.
	 *
	 * @param name - Name of injected resource
	 * @returns Stores object
	 */
	export function inject(name: "stores"): Stores;
}
