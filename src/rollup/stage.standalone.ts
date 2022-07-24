/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone compilation
 */

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

import { join } from "path";
import alias from "@rollup/plugin-alias";
import buble from "@rollup/plugin-buble";
import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import { Plugin, RollupOptions } from "rollup";
import jscc from "rollup-plugin-jscc";
import globals from "rollup-plugin-node-globals";
import nodePolyfills from "rollup-plugin-node-polyfills";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import vue from "rollup-plugin-vue";

/**
 * Rollup options.
 */
const options: RollupOptions = {
	input: join(__dirname, "..", "..", "..", "..", "src", "main", "standalone.ts"),
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

		// Transpile jsx to vue
		buble({
			include: ["**/*.tsx"],
			jsx: "vueJsxPragma"
		}),

		// Inject jsx transpilation dependencies
		inject({ vueJsxPragma: ["Vue", "h"] }),

		// To process css files
		postcss(),

		// To bundle vue correctly
		alias({
			entries: { vue: `./node_modules/vue/dist/vue.esm-browser.js` }
		}),

		// To resolve some libraries correctly
		commonjs(),

		// For builtins plugin
		// Polyfill depends on this
		globals() as Plugin,

		// Polyfill "url", and other modules
		// Has to come before resolve, to replace the builtin "url"
		nodePolyfills() as Plugin,

		// Compile for browser
		resolve({ browser: true }),

		// For debug compilation
		jscc({
			include: join(__dirname, "..", "..", "..", "..", "src", "**", "*"),
			values: { _DEBUG_ENABLED: null }
		}),

		// Required for some library compilations https://github.com/rollup/rollup-plugin-commonjs/issues/28
		json()
	]
};

export default options;
