/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Rollup for standalone.
 */

import { join } from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";

export default {
	input: join(__dirname, "..", "..", "..", "..", "src", "app", "standalone.ts"),
	output: {
		file: join(__dirname, "..", "..", "artifacts", "rollup", "standalone.js"),
		format: "esm",
		name: "client",
		sourcemap: "inline"
	},
	plugins: [
		commonjs({ namedExports: { "./node_modules/js-yaml/index.js": ["safeLoad"] } }),
		resolve({ browser: true, preferBuiltins: true }),
		globals(),
		builtins(),
		typescript()
	]
};
