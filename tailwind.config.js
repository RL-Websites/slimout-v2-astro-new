/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			// Rebrand per `SlimOut Design System.dc.html` (Claude Design audit PDF, applied
			// 2026-09-01 per explicit user decision — see SKILLS.md Design System section for
			// the full rationale/history). Token NAMES were kept identical to what every SCSS
			// partial already references (bg-primary, border-sage-300, bg-lime-dark, ...) so
			// the new palette cascades everywhere automatically with zero .astro/class-name
			// changes. Only the hex VALUES changed, remapped by the role each token actually
			// plays in the codebase, not by its (now slightly stale) name — e.g. `lime` was
			// the old bright-green brand color and is now blue, `greenDeep` was an olive-brown
			// "done/positive" text color and is now the design system's green success text.
			colors: {
				cream: "#F5F6F8", // page background
				ink: "#0B1220", // primary text, dark section bg
				forest: "#0F1D33", // alternate dark section bg (no direct PDF equivalent; interpolated between ink and primary)
				greenDeep: "#3D6B24", // success/"done" text (was olive-brown, now the PDF's semantic success green)
				dark: "#0B1220", // alias of ink
				primary: "#032C59", // primary buttons/CTAs
				accent: "#4B8BD1", // focus ring, text selection, selected/checked state
				red: "#DC2626",
				danger: "#8A4526", // destructive/error tone
				olive: "#3C5670", // secondary accent (was olive-green, now PDF's "secondary on tint")
				offwhite: "#F7F7FA", // text/surface on dark backgrounds
				"blue-4": "#12539A", // rare extra accent, reuses the primary-hover blue
				lime: {
					DEFAULT: "#4B8BD1", // accent — icon buttons, badges, underline highlights
					dark: "#12539A", // primary-hover — button/link hover, spinners
					darker: "#0A2E52", // deepest accent text/hover (interpolated)
					deep: "#4B8BD1", // accent — nav underline
				},
				sage: {
					50: "#F5F8FB",
					100: "#EAF0F7", // tint/selected surface
					200: "#E2E6EC", // default border
					300: "#C9D2DC", // outline-button border
					400: "#AAB8C7", // darker border/disabled text (interpolated)
				},
				muted: {
					light: "#93A3B8", // text-muted
					DEFAULT: "#6C7787", // text-secondary
					dark: "#3C5670", // secondary-on-tint
				},
			},
			fontFamily: {
				sora: ["Sora", "sans-serif"],
				serif: ["Instrument Serif", "Georgia", "serif"],
				sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"], // was DM Sans
				mono: ["ui-monospace", "Menlo", "monospace"],
			},
			// Named scale for the radii already recurring as one-off arbitrary values
			// (rounded-[20px] etc.) across components — new/updated components should
			// reach for these instead of picking another one-off px value.
			borderRadius: {
				field: "16px", // shared .general-input-field/.general-textarea/.input-radio/.input-checkbox radius
				card: "20px", // standard card/panel
				panel: "26px", // modal panels, larger cards
				hero: "32px", // hero/section blocks
			},
			// Named scale for the elevation shadows already recurring as one-off
			// rgba() box-shadows across components. Values matched to the real
			// formulas already in use, not invented.
			boxShadow: {
				dropdown: "0 12px 28px rgba(11, 18, 32, 0.12)", // open dropdown/select panel
				modal: "0 40px 90px -40px rgba(11, 18, 32, 0.55)", // modal panels
				card: "0 28px 54px -24px rgba(11, 18, 32, 0.4)", // product/media card lift
				toast: "0 24px 50px -22px rgba(11, 18, 32, 0.6)", // pill toast/notification
			},
		},
	},
	plugins: [],
};
