/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				cream: "#F2F2EA",
				ink: "#101A14",
				forest: "#1B2E22",
				greenDeep: "#5f6e1d",
				dark: "#101A14",
				primary: "#BBCC46",
				red: "#DC2626",
				danger: "#e2604a",
				olive: "#8B9A4D",
				offwhite: "#F7F7F0",
				"blue-4": "#2563EB",
				lime: {
					DEFAULT: "#BBCC46",
					dark: "#A8C22F",
					darker: "#7E9021",
					deep: "#94A72E",
				},
				sage: {
					50: "#F8FAF4",
					100: "#EFF2DC",
					200: "#E4E7D8",
					300: "#DCDFD0",
					400: "#CBD1C0",
				},
				muted: {
					light: "#98A292",
					DEFAULT: "#67735F",
					dark: "#3A463C",
				},
			},
			fontFamily: {
				sora: ["Sora", "sans-serif"],
				serif: ["Instrument Serif", "Georgia", "serif"],
				sans: ["DM Sans", "system-ui", "sans-serif"],
				mono: ["ui-monospace", "Menlo", "monospace"],
			},
		},
	},
	plugins: [],
};
