/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Initializes the Vue app.
 *
 * @file
 */

import { App, Component, createApp } from "vue";
import { Store, StoreOptions, createStore } from "vuex";
import { useHljsPlugin } from "./vue.plugin.hljs";

// Static init
import { useVuetifyPlugin } from "./vue.plugin.vuetify";

/**
 * Creates vue app.
 *
 * @param param - Destructured parameter
 * @returns Created app
 */
export function createVueApp<State extends object = object>({
	component,
	state,
	mutations,
	actions
}: {
	/**
	 * Root component.
	 */
	component: Component;

	/**
	 * State.
	 */
	state: State;
} & Pick<StoreOptions<State>, "actions" | "mutations">): {
	/**
	 * Vue app.
	 */
	vue: App;

	/**
	 * Store.
	 */
	store: Store<State>;
} {
	let app: App = createApp(component);
	useVuetifyPlugin({ app });
	useHljsPlugin({ app });

	const store: Store<State> = createStore<State>({
		actions,
		mutations,
		state
	});
	app.use(store);

	return { store, vue: app };
}
