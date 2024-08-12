import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	external: ["chart.js"],
	dts: true,
	sourcemap: true,
});
