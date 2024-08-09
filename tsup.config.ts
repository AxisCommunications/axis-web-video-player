import { defineConfig } from "tsup";

export default defineConfig({
	target: "esnext",
	dts: true,
	format: ["esm"],
	outDir: "dist",
	clean: true,
	minify: false,
	platform: "browser",
});
