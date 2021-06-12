/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for vue definitions
 */

import { Component, defineComponent } from "@vue/runtime-core";
import { Store } from "vuex";
import { ClientUniverse } from "../universe";
import { Theme } from "./themes";

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

/**
 * Root component.
 */
export const UniverseComponent: Component = defineComponent({
	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			what: "world"
		};
	}
});
