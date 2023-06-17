/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vite base config.
 *
 * @file
 */

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

import { join } from "path";
import buble from "@rollup/plugin-buble";
import inject from "@rollup/plugin-inject";
import vue from "@vitejs/plugin-vue";
import glslify from "rollup-plugin-glslify";
import jscc from "rollup-plugin-jscc";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { UserConfigExport } from "vite";

/**
 * Relative depth of this file to project root, when compiled to JS.
 */
const relativeDirDepth: number = 1;

/**
 * Project root directory.
 */
const rootDir: Array<string> = [__dirname, ...new Array<string>(relativeDirDepth).fill("..")];

/**
 * Base config for Vite.
 *
 * @param param - Destructured parameter
 * @returns Vite config
 */
export function defineBase({
	isProduction = true,
	environment,
	build
}: {
	/**
	 * Is production build or not.
	 */
	isProduction?: boolean;

	/**
	 * Build target environment name.
	 */
	environment: string;

	/**
	 * Build name.
	 */
	build: string;
}): UserConfigExport {
	return {
		// Relative base used in URL generation
		base: "./",

		// Options for `build` command
		build: {
			// Empty output directory before build
			emptyOutDir: isProduction,

			// Minify output
			minify: isProduction,

			// Output dir
			outDir: join(...rootDir, "build", environment, build),

			// Rollup options
			rollupOptions: {
				// Input file
				input: join(...rootDir, "src", "html", `${build}.html`),

				// Build only plugins
				plugins: [
					/*
						Polyfill "url", and other modules.
						Has to come before resolve, to replace the builtin modules, etc.
						Apparently is combined with globals plugin.
						Also seems it needs to be as part of rollup options.
					*/
					nodePolyfills()
				]
			},

			// Build source map
			sourcemap: !isProduction
		},

		// Vite mode
		mode: isProduction ? "production" : "development",

		// Global plugins
		plugins: [
			vue({
				template: { compilerOptions: { comments: false } }
			}),

			// Transpile jsx to vue
			buble({
				include: ["**/*.tsx"],
				jsx: "vueJsxPragma"
			}),

			// Inject jsx transpilation dependencies (`import { h } from "vue"`);
			inject({ vueJsxPragma: ["vue", "h"] }),

			// Imports glsl files
			glslify({ compress: isProduction }),

			// For debug compilation
			jscc({
				include: join(...rootDir, "src", "**", "*"),
				values: { _DEBUG_ENABLED: !isProduction }
			})
		],

		// For `preview`
		preview: {
			// Opens browser automatically
			open: join(...(isProduction ? [] : ["src", "html"]), `${build}.html`)
		},

		publicDir: join(...rootDir, "build", environment, `${build}-public`),

		// Project root, output directiry relative to this, output directory dependency structure is based on this dependency structure
		root: join(...rootDir, ...(isProduction ? ["src", "html"] : [])),

		// For `dev`
		server: {
			open: join(...(isProduction ? [] : ["src", "html"]), `${build}.html`)
		}
	};
}
