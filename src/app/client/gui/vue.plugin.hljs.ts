/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Initializing global css and javascript
 */

// Load common languages
import "highlight.js/lib/common";
import { join } from "path";
import vueHljs from "@highlightjs/vue-plugin";
import { App } from "vue";
import { env } from "../../common/env";

// Statically initialize css
injectLinkCss({ path: join(env.pathToRoot, "/css/hljs/a11y-light.css"), title: "a11y-light" });
injectLinkCss({ path: join(env.pathToRoot, "css/hljs/a11y-dark.css"), title: "a11y-dark" }).disabled = false;

/**
 * Uses HLJS plugin on app.
 *
 * @param param - Destructured parameter
 */
export function useHljsPlugin({
	app
}: {
	/**
	 * Vue application.
	 */
	app: App;
}): void {
	app.use(vueHljs);
}

/**
 * Dynamic injection of css into the head.
 *
 * @param param - Destructured parameter
 * @returns Link element
 */
function injectLinkCss({
	title,
	path
}: {
	/**
	 * Title attribute.
	 */
	title: string;

	/**
	 * Relative URL to css file.
	 */
	path: string;
}): HTMLLinkElement {
	let link: HTMLLinkElement = document.createElement("link");
	link.href = path;
	link.type = "text/css";
	link.rel = "stylesheet";
	link.title = title;
	link.disabled = true;
	document.head.appendChild(link);
	return link;
}
