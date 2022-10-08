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
import buble from "@rollup/plugin-buble";
import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import vue from "@vitejs/plugin-vue";
import { Plugin, RollupOptions } from "rollup";
import jscc from "rollup-plugin-jscc";
import nodePolyfills from "rollup-plugin-polyfill-node";
import postcss, { PostCSSPluginConf } from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

/**
 * Relative depth of this file, when compiled to JS.
 */
const relativeDirDepth: number = 4;

/**
 * Project root directory.
 */
const rootDir: Array<string> = [__dirname, ...new Array<string>(relativeDirDepth).fill("..")];

/**
 * Generates options for rollup.
 *
 * @param param - Destructured parameter
 * @returns Options
 */
export function defineOptions({
	isProduction = true
}: {
	/**
	 * Is production build or not.
	 */
	isProduction?: boolean;
}): RollupOptions {
	/**
	 * Rollup options.
	 */
	const options: RollupOptions = {
		input: join(...rootDir, "src", "main", "standalone.ts"),
		/**
		 * @param warning - The warning
		 * @param rollupWarn - The rollup warning function
		 */
		onwarn: (warning, rollupWarn) => {
			let conditions: Array<boolean | undefined> = new Array<boolean | undefined>();
			conditions.push(
				warning.code === "THIS_IS_UNDEFINED" &&
					warning.id?.includes("node_modules") &&
					(warning.id?.includes("io-ts") || warning.id?.includes("fp-ts"))
			);
			conditions.push(
				warning.code === "CIRCULAR_DEPENDENCY" &&
					// Coalescent required, conditional access false negative
					(warning.cycle ?? []).some(s => {
						return s.includes("index.ts") || s.includes("node_modules");
					})
			);

			if (conditions.some(c => c)) {
				return;
			}

			rollupWarn(warning);
		},
		output: {
			file: join(...rootDir, "build", "stage", "artifacts", "rollup", "standalone.js"),
			format: "esm",
			name: "client",
			sourcemap: isProduction ? "hidden" : "inline"
		},
		plugins: [
			// For typescript; "rollup-plugin-typescript2" preferred over official due to https://github.com/rollup/plugins/issues/608
			typescript({ tsconfig: join(...rootDir, "tsconfig", "stage", "base.json") }),

			// Vue does not like HTML comments
			vue({ template: { compilerOptions: { comments: false } } }) as Plugin,

			// Transpile jsx to vue
			buble({
				include: ["**/*.tsx"],
				jsx: "vueJsxPragma"
			}),

			// Inject jsx transpilation dependencies (`import { h } from "vue"`);
			inject({ vueJsxPragma: ["vue", "h"] }),

			// To process css files
			postcss({
				// Disables `less` support, as all enabled by default; Adding path so that `node_modules` resolves
				// Seems `postcss` not typed correctly
				use: [["sass", { includePaths: [join(...rootDir, "node_modules")] }]] as unknown as PostCSSPluginConf["use"]
			}),

			// To resolve some libraries correctly
			// Has to come before modules manipulating code, so that import statements can be interpreted
			commonjs(),

			/*
				Polyfill "url", and other modules.
				Has to come before resolve, to replace the builtin modules, etc.
				Apparently is combined with globals plugin.
			*/
			nodePolyfills(),

			// Compile for browser
			resolve({
				browser: true,
				rootDir: join(...rootDir)
			}),

			// For debug compilation
			jscc({
				include: join(...rootDir, "src", "**", "*"),
				values: { _DEBUG_ENABLED: !isProduction }
			}),

			// Required for some library compilations https://github.com/rollup/rollup-plugin-commonjs/issues/28
			json()
		]
	};

	return options;
}
