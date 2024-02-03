/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

// TODO: Rename to `vue.ts`
/**
 * @file
 * Initializes the Vue app.
 */

import { Pinia, createPinia } from "pinia";
import { App, Component, createApp } from "vue";
import { Stores, composableStoreFactory } from "../../vue/core/store";
import { ClientUniverse } from "../universe";
import { useHljsPlugin } from "./vue.plugin.hljs";

// Static init
import { AppI18n, useVuetifyPlugin } from "./vue.plugin.vuetify";

/**
 * Type returned during initialization of Vue, with prefix to avoid ambiguity.
 */
export type AppVue = {
	/**
	 * Vue app.
	 */
	vue: App;

	/**
	 * Stores for pinia.
	 */
	stores: Stores;

	/**
	 * Internationalization plugin.
	 */
	i18n: AppI18n;
};

// TODO: Rename to "createVue"
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
}): AppVue {
	let app: App = createApp(component);
	let i18n: AppI18n = useVuetifyPlugin({ app });
	useHljsPlugin({ app });

	const pinia: Pinia = createPinia();
	const stores: Stores = composableStoreFactory({ universe });
	app.use(pinia);
	app.provide("stores", stores);

	return { i18n, stores, vue: app };
}
