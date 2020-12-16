/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Rollup for standalone.
 */

import commonjs from "@rollup/plugin-commonjs";
import { join } from "path";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
	input: join(__dirname, "..", "..", "..", "..", "src", "app", "standalone.ts"),
	output: {
		file: join(__dirname, "..", "..", "artifacts", "rollup", "standalone.js"),
		format: "esm",
		name: "client",
		sourcemap: "inline"
	},
	plugins: [commonjs(), resolve({ browser: true, preferBuiltins: true }), typescript()]
};
