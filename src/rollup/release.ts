import commonjs from "@rollup/plugin-commonjs";
import { join } from "path";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
	input: join(__dirname, "..", "..", "..", "..", "src", "app", "client.ts"),
	output: {
		file: join(__dirname, "..", "..", "artifacts", "rollup", "client.js"),
		format: "esm",
		name: "pixi"
	},
	plugins: [commonjs(), resolve({ preferBuiltins: true }), typescript({ tsconfig: false })]
};
