import { defineConfig } from "vite";
import dns from "node:dns";
import wasm from "vite-plugin-wasm";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [wasm()],
	build: {
		minify: false,
		sourcemap: true,
	},
	server: {
		host: "localhost",
		port: 3000,
	},
	preview: {
		port: 3000,
		host: "localhost",
	},
});
