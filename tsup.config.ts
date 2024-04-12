import { defineConfig } from "tsup";

export default defineConfig({
	target: "esnext",
	dts: true,
	format: ["esm"],
	outDir: "dist",
	clean: true,
	minify: false,
	platform: "browser",
	noExternal: process.env.LOCAL_PACK ? ["@axteams-one/webrtcvideo"] : [],
});
