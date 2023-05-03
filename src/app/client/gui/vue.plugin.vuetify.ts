/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Initializes Vuetify plugin.
 *
 * @file
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { App } from "vue";
import { createVuetify } from "vuetify";
import { aliases, fa } from "vuetify/iconsets/fa-svg";

// Initialize Vuetify
import "../style/vuetify.scss";

// Initialize FA
library.add(fas);
library.add(far);

/**
 * Uses Vuetify plugin on app.
 *
 * @param param - Destructured parameter
 */
export function useVuetifyPlugin({
	app
}: {
	/**
	 * Vue application.
	 */
	app: App;
}): void {
	// Add icon component
	app.component("font-awesome-icon", FontAwesomeIcon);

	// Add Vuetify
	app.use(
		createVuetify({
			icons: {
				aliases,
				defaultSet: "fa",
				sets: {
					fa
				}
			}
		})
	);
}
