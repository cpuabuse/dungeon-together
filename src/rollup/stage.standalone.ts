/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Rollup for standalone.
 */

import { join } from "path";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import jscc from "rollup-plugin-jscc";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import vue from "rollup-plugin-vue";

export default {
	input: join(__dirname, "..", "..", "..", "..", "src", "app", "standalone.ts"),
	output: {
		file: join(__dirname, "..", "..", "artifacts", "rollup", "standalone.js"),
		format: "esm",
		name: "client",
		sourcemap: "inline"
	},
	plugins: [
		// For typescript; "rollup-plugin-typescript2" preferred over official due to https://github.com/rollup/plugins/issues/608
		typescript(),

		// To process vue
		vue(),

		// To process css files
		postcss(),

		// To bundle vue correctly
		alias({
			entries: { vue: `./node_modules/vue/dist/vue.esm-browser.js` }
		}),

		// To resolve some libraries correctly
		commonjs({
			namedExports: {
				"./node_modules/js-yaml/index.js": ["safeLoad"],
				"./node_modules/mousetrap/mousetrap.js": ["bind"]
			}
		}),

		// Compile for browser
		resolve({ browser: true, preferBuiltins: true }),

		// For builtins plugin
		globals(),

		// For things like http
		builtins(),

		// For debug compilation
		jscc({
			include: join(__dirname, "..", "..", "..", "..", "src", "**", "*"),
			values: { _DEBUG_ENABLED: null }
		}),

		// Required for some library compilations https://github.com/rollup/rollup-plugin-commonjs/issues/28
		json()
	]
};
