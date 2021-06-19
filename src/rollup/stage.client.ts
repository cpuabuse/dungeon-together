/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Rollup for stage.
 */

import { join } from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
	input: join(__dirname, "..", "..", "..", "..", "src", "app", "client.ts"),
	output: {
		file: join(__dirname, "..", "..", "artifacts", "rollup", "client.js"),
		format: "esm",
		name: "client",
		sourcemap: "inline"
	},
	plugins: [
		commonjs({ namedExports: { "./node_modules/js-yaml/index.js": ["safeLoad"] } }),
		resolve({ browser: true, preferBuiltins: true }),
		typescript()
	]
};
