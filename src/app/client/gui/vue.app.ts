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
import { createStore } from "vuex";
import { useHljsPlugin } from "./vue.plugin.hljs";

// Static init
import { useVuetifyPlugin } from "./vue.plugin.vuetify";

/**
 * Creates vue app.
 *
 * @param param - Destructured parameter
 * @returns Created app
 */
export function createVueApp<State extends object>({
	component,
	state,
	mutations
}: {
	/**
	 * Root component.
	 */
	component: Component;

	/**
	 * State.
	 */
	state?: State;

	/**
	 * Mutations.
	 */
	mutations?: Record<string, (state: State, payload: any) => void>;
}): App {
	let app: App = createApp(component);
	useVuetifyPlugin({ app });
	useHljsPlugin({ app });

	if (state) {
		app.use(
			createStore<State>({
				mutations,
				state
			})
		);
	}

	return app;
}
