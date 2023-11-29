/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Initializes the Vue app.
 *
 * @file
 */

import { Pinia, createPinia } from "pinia";
import { App, Component, createApp } from "vue";
import { Stores, composableStoreFactory } from "../../vue/core/store";
import { ClientUniverse } from "../universe";
import { useHljsPlugin } from "./vue.plugin.hljs";

// Static init
import { useVuetifyPlugin } from "./vue.plugin.vuetify";

/**
 * Creates vue app.
 *
 * @param param - Destructured parameter
 * @returns Created app
 */
export function createVueApp({
	component,
	universe
}: {
	/**
	 * Root component.
	 */
	component: Component;

	/**
	 * Universe.
	 */
	universe: ClientUniverse;
}): {
	/**
	 * Vue app.
	 */
	vue: App;

	/**
	 * Stores for pinia.
	 */
	stores: Stores;
} {
	let app: App = createApp(component);
	useVuetifyPlugin({ app });
	useHljsPlugin({ app });

	const pinia: Pinia = createPinia();
	const stores: Stores = composableStoreFactory({ universe });
	app.use(pinia);
	app.provide("stores", stores);

	return { stores, vue: app };
}
