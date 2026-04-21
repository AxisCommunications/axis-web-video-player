import { defineConfig } from "tsdown";

export default defineConfig({
	target: "esnext",
	dts: true,
	format: ["esm"],
	outDir: "dist",
	clean: true,
	minify: false,
	platform: "browser",
});
