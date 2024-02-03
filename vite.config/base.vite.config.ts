/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 *
 * Vite base config.
 */

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

import { join } from "path";
import inject from "@rollup/plugin-inject";
import vue from "@vitejs/plugin-vue";
import glslify from "rollup-plugin-glslify";
import jscc from "rollup-plugin-jscc";
import { PluginOption, UserConfigExport } from "vite";
import checker from "vite-plugin-checker";
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
 * Reusable record for checker plugin configs.
 */
const checkerConfigRecord: Record<"tsconfigPath", string> = {
	tsconfigPath: "tsconfig/vite-check.tsconfig.json"
};

/**
 * Base config for Vite.
 *
 * @param param - Destructured parameter
 * @returns Vite config
 */
export function defineBase({
	isProduction = true,
	isClient = true,
	isTest = false,
	environment,
	build
}: {
	/**
	 * Will the client libraries be loaded or not.
	 */
	isClient?: boolean;

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

	/**
	 * Build from test folder or not.
	 */
	isTest?: boolean;
}): UserConfigExport {
	const appSrcDir: string = "src";
	const srcDir: string = isTest ? "test" : "src";
	const mainDir: string = isClient ? "html" : "main";
	const mainExtension: string = isClient ? "html" : "ts";
	const inputFilePath: string = join(...rootDir, srcDir, mainDir, `${build}.${mainExtension}`);
	const openUrl: string = join(...(isProduction ? [] : [srcDir, mainDir]), `${build}.${mainExtension}`);

	return {
		// Relative base used in URL generation
		base: "./",

		// Options for `build` command
		build: {
			...(isClient
				? {}
				: {
						lib: {
							// Array makes to respect original input filename
							entry: [inputFilePath],
							formats: ["es"]
						}
					}),

			// Empty output directory before build
			emptyOutDir: isProduction,

			// Minify output
			minify: isProduction,

			// Output dir
			outDir: join(...rootDir, "build", environment, build),

			// Rollup options
			rollupOptions: {
				...(isClient
					? {
							// Input file
							input: inputFilePath,

							output: {
								// Do not create a new chunk for dynamic imports
								inlineDynamicImports: true
							}
						}
					: {}),

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
			checker({
				typescript: checkerConfigRecord,
				vueTsc: checkerConfigRecord
			}),

			...(isClient
				? [
						vue({
							isProduction,
							template: { compilerOptions: { comments: false } }
						}),

						// Casting, Rollup plugin not typed for Vite
						// Inject jsx transpilation dependencies (`import { h } from "vue"`);
						inject({ vueJsxPragma: ["vue", "h"] }) as PluginOption,

						// Casting, Rollup plugin not typed for Vite
						// Imports glsl files
						glslify({ compress: isProduction }) as PluginOption,

						/*
							Polyfill "url", and other modules.
							Has to come before resolve, to replace the builtin modules, etc.
							Apparently is combined with globals plugin.
							Also seems it needs to be as part of rollup options.
							This specific library works with Vite out of the box.
						*/
						nodePolyfills()
					]
				: []),

			// Casting, Rollup plugin not typed for Vite
			// For debug compilation
			jscc({
				include: join(...rootDir, appSrcDir, "**", "*"),
				values: { _DEBUG_ENABLED: !isProduction }
			}) as PluginOption
		],

		// Project root, output directiry relative to this, output directory dependency structure is based on this dependency structure
		root: join(...rootDir, ...(isProduction ? [srcDir, "html"] : [])),

		// For `preview`
		...(isClient
			? {
					preview: {
						// Opens browser automatically
						open: openUrl
					},

					publicDir: join(...rootDir, "build", environment, `${build}-public`),

					// For `dev`
					server: {
						open: openUrl
					}
				}
			: {})
	};
}
