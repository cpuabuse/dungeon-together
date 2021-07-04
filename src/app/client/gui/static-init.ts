/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Initializing global css and javascript
 */

// Load common languages
import "highlight.js/lib/common";

/**
 * Dynamic injection of css into the head.
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

injectLinkCss({ path: "css/hljs/a11y-light.css", title: "a11y-light" });
injectLinkCss({ path: "css/hljs/a11y-dark.css", title: "a11y-dark" }).disabled = false;
