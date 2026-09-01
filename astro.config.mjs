// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// scopedStyleStrategy: "where",
	output: "static",
	devToolbar: { enabled: false },
	build: {
		format: "file",
	},
	compressHTML: false,
});
