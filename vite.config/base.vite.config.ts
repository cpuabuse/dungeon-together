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
import inject from "@rollup/plugin-inject";
import vue from "@vitejs/plugin-vue";
import glslify from "rollup-plugin-glslify";
import jscc from "rollup-plugin-jscc";
import { UserConfigExport } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { ViteDefine } from "../src/app/common/env";

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
				plugins: []
			},

			// Build source map
			sourcemap: !isProduction
		},

		define: Object.entries({
			__VITE_DEFINE_PATH_TO_ROOT__: isProduction ? "./" : "../../"
			// ESLint doesn't infer
			// eslint-disable-next-line @typescript-eslint/typedef
		} satisfies ViteDefine).reduce((result, [key, value]) => ({ ...result, [key]: JSON.stringify(value) }), {}),

		esbuild: {
			// Force-transform the JSX here, so can set to `preserve` in `tsconfig`, and keep compilation linting
			jsx: "transform"
		},

		// Vite mode
		mode: isProduction ? "production" : "development",

		// Global plugins
		plugins: [
			vue({
				template: { compilerOptions: { comments: false } }
			}),

			// Inject jsx transpilation dependencies (`import { h } from "vue"`);
			inject({ vueJsxPragma: ["vue", "h"] }),

			// Imports glsl files
			glslify({ compress: isProduction }),

			// For debug compilation
			jscc({
				include: join(...rootDir, "src", "**", "*"),
				values: { _DEBUG_ENABLED: !isProduction }
			}),

			/*
				Polyfill "url", and other modules.
				Has to come before resolve, to replace the builtin modules, etc.
				Apparently is combined with globals plugin.
				Also seems it needs to be as part of rollup options.
				This specific library works with Vite out of the box.
			*/
			nodePolyfills()
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
