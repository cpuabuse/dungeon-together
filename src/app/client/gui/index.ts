/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for vue definitions
 */

import { Store } from "vuex";
import { ClientUniverse } from "../universe";
import { Theme } from "./themes";

/**
 * Reexport.
 */
export { createVueApp } from "./vue.app";

/**
 * State type for vuex.
 */
export interface UniverseState {
	/**
	 * Reference to client universe instance.
	 */
	universe: ClientUniverse;

	/**
	 * If theme is light.
	 */
	theme: Theme;

	/**
	 * Records of various things.
	 */
	records: Record<string | symbol, any>;
}

/**
 * Universe store.
 */
export type UniverseStore = Store<UniverseState>;

/**
 * Cast this to access store.
 */
export type ThisVueStore = {
	/**
	 * Vuex store.
	 */
	$store: UniverseStore;
};
