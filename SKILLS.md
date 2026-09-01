---
name: slimout-astro-tailwind

description: >
  
  Guidelines for working safely and consistently on the SlimOut v2 Astro + Tailwind CSS project.
  
  Covers framework conventions, BEM/SCSS component patterns, the standalone CSS build pipeline,
  
  and asset management.
---

<!-- Gitignored, local-only reference. Keep up to date. -->

# SlimOut v2 Project Skills

## Framework & Setup

- Astro v7.2.2 + TypeScript. Styling: Tailwind CSS v4 + Sass (`@apply`/`@layer` in BEM SCSS partials).

- **CSS is compiled OUTSIDE Astro/Vite** — see CSS Build Pipeline. Most important non-standard fact.

- `compressHTML: false` in `astro.config.mjs` — keeps `dist/index.html` readable + preserves section comments.

- Dev: `npm run dev` (CSS watcher + `astro dev` together). Build: `npm run build`. Types auto-generated on build.

## Project Structure

```

public/Themes/Thrivewellrx.Theme.SlimoutV2/assets/

  img/ icons/ fonts/          # final optimized assets

  css/                        # BUILD OUTPUT — style.css, do not hand-edit

  scss/                       # SCSS SOURCE — base/, components/, main.scss

scripts/  build-css.mjs (one-shot) · watch-css.mjs (watch) · dev.mjs (watch + astro dev)

src/  components/ layouts/ pages/

```

No `src/styles` — all SCSS source lives under the theme's `assets/scss/`.

## Path Convention: Relative, Never Root-Absolute

Always relative, no leading `/`: `Themes/.../style.css` not `/Themes/...`; `href="#programs"` not `href="/#programs"`.

**Why**: root-absolute paths break under `file://`, Live Server, or any root other than the real deploy root. Applies to stylesheet/favicon links, `<img src>`, and same-page anchors. Single-page site today; if a second nested-path page appears, re-check relative depth or add a base-path constant.

## CSS Build Pipeline

1. `sass` compiles `assets/scss/main.scss` (imports `base/*`, `components/*`) to plain CSS. (`@import` deprecation warning silenced deliberately — switching to `@use`/`@forward` isn't a drop-in swap.)

2. Script injects `@import "tailwindcss";` + `@config "<abs path to tailwind.config.js>";` into the compiled output directly (not in `main.scss`, since Sass can't resolve `tailwindcss` as a partial).

3. Plain `postcss` + `@tailwindcss/postcss` + `autoprefixer` resolve `@apply`/`@layer` + vendor-prefix.

4. Output written to `assets/css/style.css`; Astro copies it as a static asset. `Layout.astro` links it via plain relative `<link>`, never an ESM import.

**Commands**: `npm run build:css` (once) · `npm run dev` (watch + astro dev, via `scripts/dev.mjs`) · for Astro's own `--background` server, run `build:css` once first (it has no idea the SCSS pipeline exists).

**Tradeoff**: SCSS source lives in `public/` so it also gets copied into `dist/` (dead weight, expected).

**Gotcha**: editing a `.scss` partial doesn't hot-reload through Vite — run `npm run dev` (auto) or `npm run build:css` manually.

## Component Patterns

- Components for meaningful sections only, one responsibility each, reuse before creating new.

- **`src/components/utils/Button.astro` is deprecated — do not use it for new buttons/links.** Write plain `<a>`/`<button>` markup directly and apply `theme-btn` classes by hand (see Button Classes below). Existing usages aren't required to be migrated immediately, but don't add new ones.

- Semantic HTML — no div-heavy markup (exception: `.site-header`/`.site-footer` wrappers in `index.astro`, for comment-preservation, see HTML Comments).

- Props via TypeScript interfaces.

- **No Tailwind utility classes in markup, ever** — BEM class only; utilities live in the matching SCSS partial via `@apply`. `class:list` OK for BEM modifiers, never utilities.

  **Button classes are the one BEM exception with baked-in modifiers** (see Button Classes below) — no raw Tailwind utilities needed on buttons/links; stack `theme-btn` + one `__variant` + optional `--size`/`--full` as separate classes via `class:list` or a template string.

- **One class per element, always** — never stack two static classes. Need shared styling + own identity → one fully-named modifier class, `@extend` the shared class in SCSS. **Exception**: `theme-btn` (see Button Classes below) is a multi-part BEM system by design — base + `__variant` + optional `--size`/`--full`/`--icon` are meant to be stacked together on one element.

- Page-specific components → own subfolder named after the flow (`src/components/quiz/`, `src/components/intake/`).

- Shared components → `src/components/common/` (step-flow chrome, sitewide `Header`/`Footer`/`FaqSection`); field primitives → `common/fields/`. `Logo.astro` stays flat (leaf, imported by both `Header` and `CommonLogoBar`).

- Fix relative imports when moving a component between subfolders (e.g. `./fields/...` → `../fields/...`).

```astro

---

interface Props { title: string; description?: string; }

const { title, description } = Astro.props;

---

<section class="hero">

  <h2 class="hero-title">{title}</h2>

  {description && <p class="hero-description">{description}</p>}

</section>

```

## Button Classes

Defined in `assets/scss/components/_button.scss`. Write plain `<a>`/`<button>` markup, no `Button.astro` wrapper (see Component Patterns). Always start with base `.theme-btn`, then add exactly one `__variant`, then optional `--size`/`--full`/`--icon` modifiers — stack them as separate classes.

- **Base (required)**: `theme-btn`
- **Variants (pick one)**: `theme-btn__primary` · `theme-btn__secondary` · `theme-btn__white` · `theme-btn__outline` (+ `theme-btn__outline--white` for a dark-background version) · `theme-btn__outline-dark` · `theme-btn__icon` (icon-only circular button) · `theme-btn__danger` · `theme-btn__link` (no background, underlined text)
- **Size modifiers (optional)**: `theme-btn--sm` · `theme-btn--lg`
- **Layout modifiers (optional)**: `theme-btn--full` (full width) · `theme-btn--icon` (icon-only padding/shape, distinct from the `__icon` variant)
- **State**: `.is-disabled` class, or native `disabled`/`aria-disabled="true"` attributes — all styled automatically, don't add extra classes for disabled state.
- **Unrelated utility**: `.w-100` (plain `width: 100%`, not part of the `theme-btn` BEM chain) — declared in the same file but not a button variant.

```astro
<a href="/checkout" class="theme-btn theme-btn__primary theme-btn--lg">Checkout</a>
<button type="submit" class="theme-btn theme-btn__outline theme-btn--sm" disabled>Save</button>
<a href="#" class="theme-btn theme-btn__outline theme-btn__outline--white">Learn more</a>
```

Need a variant/modifier that doesn't exist yet? Add it to `_button.scss` under the existing `&__name`/`&--name` pattern — don't reach for a raw Tailwind utility on a button element.

## Design System (Visual Reference)

Source: a Claude Design audit (`SlimOut Design System.dc.html`). Its brand-color and font-family values (a navy-blue `#032C59`/`#4B8BD1` palette, "Plus Jakarta Sans") did **not** match the codebase when first checked — verified by grepping `tailwind.config.js` and every SCSS partial, which at the time used a lime-green/ink brand (`primary #BBCC46`, `ink #101A14`) and Sora/DM Sans/Instrument Serif fonts. Raised with the user, who **explicitly confirmed a full rebrand to the PDF's navy-blue palette and typography** (2026-09-01) — so the navy palette below is now the real, applied brand, not a rejected mismatch. Don't revert toward the old lime-green values.

**How the rebrand was applied**: every Tailwind color/font-family token KEPT ITS NAME (`primary`, `ink`, `lime.dark`, `sage.300`, `font-sans`, …) — only the hex/font values changed in `tailwind.config.js`. Every SCSS partial already referenced colors by these semantic class names (`bg-primary`, `border-sage-300`, never raw hex, per the "no Tailwind utilities in markup" + `@apply`-only rules above), so the new palette cascaded automatically with **zero `.astro` changes and zero SCSS class-name changes** — only token values and a handful of `bg-[#rawhex]`/`rgba(...)` literals that dodged the semantic classes were hand-updated to match. If you see an old value like `#BBCC46`, `#101A14`, `#F2F2EA`, `#F7F7F0`, `#A8C22F`, or `DM Sans` anywhere, it's a miss from this rebrand — fix it to the new palette below, don't treat it as intentional.

### Color Tokens

Real tokens live in `tailwind.config.js` (`theme.extend.colors`) — this is the one design-token system; don't add a parallel `:root` CSS-variable set. Some token *names* no longer describe their color (`lime` is now blue, `greenDeep` is now a green success color rather than an olive-brown one) because renaming the name would mean touching every `@apply` site across ~80 files for a purely cosmetic gain — go by the role/comment in `tailwind.config.js`, not the literal name.

- `cream` `#F5F6F8` — page background (`body` in `_reset.scss`)
- `ink` `#0B1220` — primary text, dark section backgrounds (hero/CTA blocks)
- `forest` `#0F1D33` — alternate dark section background (category hero; interpolated, no direct PDF equivalent)
- `offwhite` `#F7F7FA` — text/surface on dark backgrounds
- `primary` `#032C59` — primary buttons/CTAs only
- `accent` `#4B8BD1` — **new token**: focus ring, text selection, selected/checked state — the PDF splits this from `primary`, don't reuse `primary` for focus/selection
- `lime.DEFAULT/dark/darker/deep` — `#4B8BD1`/`#12539A`/`#0A2E52`/`#4B8BD1` — button/link hover shades, spinners, nav underline, icon-button fill (role names are stale, see above)
- `olive` `#3C5670` — secondary accent (PDF's "secondary on tint")
- `greenDeep` `#3D6B24` — success/"done" text (PDF's semantic success green, not the old olive-brown)
- `muted.light/DEFAULT/dark` — `#93A3B8`/`#6C7787`/`#3C5670` — secondary text, form labels, filter chips
- `sage.50/100/200/300/400` — `#F5F8FB`/`#EAF0F7`/`#E2E6EC`/`#C9D2DC`/`#AAB8C7` — light surfaces, input borders/backgrounds, dashed drop-zone fills
- `danger` `#8A4526` — destructive/error tone; `red` (Tailwind's default red-500/800, unaffected by this config) still backs `.theme-btn__danger` — left alone, semantic danger red is expected to stay vivid even through a rebrand
- `blue-4` `#12539A` — rarely used accent, reuses the primary-hover blue

Recurring raw hex not yet promoted to a Tailwind color (appear as `bg-[#...]`/`border-[#...]` arbitrary values — safe to reuse as-is, don't invent new ones):
- `#E4E7DA` / `#A9B2A5` — disabled button background/text (`.theme-btn.is-disabled`)
- `#DDE1D2`, `#E4E7DA`, `#E4E9DE`, `#C3CBBD` — input/card border variants
- `#C6D38A` — dashed drop-zone border (file upload) — left unchanged, it's a status-adjacent tint not part of the brand palette
- Status pill pairs (see Tables/Badges below) — `#FBF0D4`/`#7A5A11`, `#DFEEF6`/`#1D5872`, `#E4F1DA`/`#3D6B24`, `#FBE3DA`/`#8A4526`, `#EFF1E6`/`#5A6653` — these already matched the PDF's semantic badge colors exactly before the rebrand, so they weren't touched

### Typography

Loaded in `_font-file.scss`: **Sora**, **Instrument Serif**, **Plus Jakarta Sans** (was DM Sans, swapped for the rebrand).

- Display/headings: `font-sora` (Sora), weights 400/500/600/700.
- Body/UI text: `font-sans` (now **Plus Jakarta Sans**) — paragraphs, labels, buttons, nav links, inputs, form fields. This is the actual default body font (Tailwind `font-sans`), not a second family.
- Accent word: `font-serif` (Instrument Serif) italic — one emphasized word inside a heading or empty-state message (see `&-title-alt` pattern in `_my-orders.scss`), never a whole sentence.
- Eyebrow/mono: `font-mono` (`ui-monospace, Menlo, monospace`), uppercase, wide letter-spacing (`tracking-[0.1em]`–`tracking-[0.26em]`) — section eyebrows, table/badge labels, filter chips.
- Sizes are a mix of fluid `clamp()` (hero/section headings) and fixed Tailwind arbitrary values (`text-[15px]`, `text-[13.5px]`) for body/UI text — match whichever pattern the component you're editing already uses; don't switch a fixed-size component to `clamp()` speculatively.

### Buttons (values behind the `theme-btn` classes — see Button Classes above for names)

Defined in `_button.scss`. Actual variant values (now navy/blue after the rebrand):

| Variant | Background | Text | Radius | Hover |
|---|---|---|---|---|
| `__primary` | `bg-primary` (`#032C59`) | white | `rounded-full` | `bg-lime-dark` (`#12539A`) |
| `__secondary` | `bg-muted` | white | `rounded-full` | `bg-muted-dark` |
| `__white` | `bg-offwhite` | `text-ink` | `rounded-full` | shadow lift |
| `__outline` | `bg-offwhite` | `text-ink`, `border-sage-300` (`#C9D2DC`) | `rounded-full` | `bg-dark text-white` |
| `__outline--white` | transparent | white, `border-offwhite` | `rounded-full` | `bg-offwhite text-dark` |
| `__outline-dark` | transparent | `text-ink`, `border-ink` | `rounded-full` | `bg-ink text-offwhite` |
| `__danger` | `bg-red-500` | white | `rounded-full` | `bg-red-800` |
| `__icon` | `bg-lime` (`#4B8BD1`) | — | `rounded-full`, 44×44 | icon rotates -45° |
| `__link` | none, underline | `text-primary` (`#032C59`) | n/a | `text-lime-dark` (`#12539A`) |
| `.is-disabled` | `bg-[#E4E7DA]` | `text-[#A9B2A5]` | inherits | none, `cursor-not-allowed` |

- Focus: global `:focus-visible` ring (see States below) — `.theme-btn` no longer defines its own; it inherits the site-wide rule, which uses `accent`, not `primary`.
- Active/pressed: `scale-95` on `:active:not(:disabled)` — buttons are the one place a real `:active` treatment exists.
- Loading: `.theme-btn__loader` — an actual spinning-border spinner element (`border-2 border-primary border-t-white`, `animation: spin`) already exists; use it for any new async button instead of a label-swap pattern.

### Form Controls

Two parallel systems exist — reuse the matching one, don't mix them:

1. **`_fields.scss`** (`.general-input`, `.general-textarea`, `.input-radio`/`.input-checkbox`) — the newer, more complete shared system. Input/textarea: `rounded-field` (16px, was `rounded-2xl`), `border-[1.5px] border-[#DDE1D2]`, `bg-white`, `text-[15.5px]`. Disabled: `bg-sage-50 text-sage-400 cursor-not-allowed` (already implemented — don't add a second disabled style). Placeholder: `text-sage-400` (already styled — don't leave it unset). Error: `data-error="true"` / `.general-input--error` → `border-[#C24A3A]`, error text `text-[#C24A3A]`.
2. **`.checkbox`/`.checkbox__box`** (`_checkbox.scss`) and **`.checkout-checkbox`** (`_checkout-checkbox.scss`) — older, JS-toggled `.is-checked` div-based checkboxes with no real `<input>` underneath (not natively keyboard-focusable). Don't extend this pattern for new checkboxes — use `.input-checkbox` from `_fields.scss` instead, which wraps a real hidden `<input>` and is keyboard/focus-visible accessible.
3. **`.input-radio-dot`/`.input-checkbox-box`** (`_fields.scss`): 20px box/circle, `border-[1.5px] border-[#C3CBBD]`, checked fill `bg-lime-dark`/`border-lime-dark` (`#12539A`).
4. **`.state-select`** (`_custom-select-dropdown.scss`): trigger `rounded-xl` (12px), `bg-sage-50 border-[#DDE1D2]`; open panel `rounded-xl`, `shadow-dropdown` token.

### Cards

Radius is genuinely inconsistent across otherwise-equivalent cards — **confirmed real drift**, not an audit artifact: `rounded-[18px]`, `rounded-[20px]`, `rounded-[22px]`, `rounded-[24px]`, `rounded-[26px]`, plain `rounded-2xl`/`rounded-3xl`/`rounded-xl` all appear on visually similar white bordered panels (`_account.scss`, `_my-orders.scss`, `_checkout-form.scss`, `_cart-summary.scss`, `_order-details.scss`, `_order-status-modal.scss`, etc.). `tailwind.config.js` has tokens to converge future work: `rounded-field` (16px, inputs/textareas/radio-checkbox rows — matches `_fields.scss`'s canonical shared classes, which now use it), `rounded-card` (20px, standard card), `rounded-panel` (26px, modal/larger card — `.modal-panel` now uses it), `rounded-hero` (32px, hero/CTA sections). Prefer these on new/edited cards instead of another one-off `rounded-[Npx]`. **Not retroactively unified**: the dozen+ page-specific cards still on 18/20/22/24px arbitrary values — that's a broad, purely-cosmetic diff across many files, deliberately left for a dedicated pass rather than folded into incidental edits.

Typical pattern: `bg-white border border-[#E4E7DA]` (or `border-sage-200`), padding scales `p-5`→`p-8` mobile-to-desktop.

### Borders, Radius & Shadows

`tailwind.config.js` tokens (existing arbitrary values still work elsewhere, use these going forward):

- `rounded-field` 16px · `rounded-card` 20px · `rounded-panel` 26px (used by `.modal-panel`, which every modal partial extends) · `rounded-hero` 32px (plus Tailwind's own `rounded-full` for pills/999px, already used everywhere for buttons/badges).
- `shadow-dropdown` · `shadow-modal` · `shadow-card` · `shadow-toast` — all four now built on `rgba(11, 18, 32, …)`, the new `ink`'s RGB (was `rgba(16, 26, 20, …)`, the old ink's RGB) — used by `.state-select-panel`, `.modal-panel`/`.intake-modal-panel`, `.product-card:hover`/`.experience-badge`, and `.account-toast`/`.notification-toast` respectively.
- Every other one-off elevation shadow across the codebase (`_header.scss`, `_my-orders.scss`, `_nav-bar.scss`, `_checkout-terms-modal.scss`, `_drawer.scss`, `_delivery.scss`, `_cart-sticky.scss`) was swept from the old `rgba(16, 26, 20, …)` ink-tint to the new `rgba(11, 18, 32, …)` for consistency. The separate `rgba(12, 20, 15, …)` used specifically for modal/drawer **overlay** backgrounds (`_modal.scss`, `_drawer.scss`, `_checkout-terms-modal.scss`, `_file-slot.scss`, `_header.scss`'s scrim gradient) was left as-is — that's the PDF's own documented Overlay color, a deliberately distinct near-black from `ink`, not a typo.
- Card hover lift: `-translate-y-[3px]` (or `-translate-y-0.5` for smaller elements) + one of the shadow tokens above.

### States (hover / focus / active / disabled)

- **Focus** — single global rule in `_reset.scss`: `:focus-visible { @apply outline-none ring-2 ring-accent ring-offset-2; }`. Uses `accent` (`#4B8BD1`), not `primary` — the PDF documents focus/selection as a separate color from the button/CTA color, and `primary` is now a dark navy that would be low-contrast as a ring. Covers every native and custom interactive element (links, inputs, selects, textareas, buttons, and — via `:has()` in `_fields.scss`/`_selectable-card.scss` — the visually-hidden native inputs inside `.input-checkbox`/`.input-radio`/`.selectable-card`). Reuse this rule; don't add a per-component focus style.
- Text selection (`::selection`) also uses `accent`, with white text (`bg-accent text-white`) — `bg-primary text-ink` would put dark ink text on a dark navy background.
- Hover: buttons/links darken to a `-dark`/`-darker` shade of their base color or `bg-muted-dark`; cards/images lift with `-translate-y-[Npx]` + shadow; filter chips and select triggers get a subtle lift/border change.
- Active/pressed: `scale-95` exists on buttons; most other elements have no distinct `:active` treatment — don't invent one unless asked.
- Disabled: buttons — `bg-[#E4E7DA] text-[#A9B2A5] cursor-not-allowed`; inputs/textareas — `bg-sage-50 text-sage-400 cursor-not-allowed`; checkboxes/radios — `opacity-50 pointer-events-none` via `.input-radio--disabled`/`.input-checkbox--disabled`.
- Selected: `.input-radio`/`.input-checkbox` checked → `border-lime bg-sage-100`, dot/box fill `bg-lime-dark`/`border-lime-dark` (`#12539A`); filter chips `.is-active` → `bg-ink text-offwhite border-ink`.
- Loading: `.theme-btn__loader` spinner (see Buttons).

### Navigation

See `_header.scss`, `_nav-bar.scss`, `_sticky-nav.scss`, `_mobile-drawer.scss` for the real implementation. Header uses a shadow transition on scroll rather than a background-color/blur crossfade. Mobile nav is a full-screen drawer (`_mobile-drawer.scss`). Don't restructure nav markup/behavior — visual tokens only.

### Modals & Drawers

`_modal.scss`/`_modal-alert.scss`/`_drawer.scss`: panel `bg-[#FBFBF7]`, `rounded-panel`, `shadow-modal`, overlay `rgba(12,20,15,0.5)` (see Borders/Shadows above for why that rgba differs from `ink`). The modal panel intentionally sets `&:focus-visible { outline: 0; }` — it's a programmatically-focused container, not a tabbed control, so it correctly opts out of the global focus ring; don't "fix" that.

### Tables, Badges & Alerts

**Badges** — `.order-badge` in `_my-orders.scss` is the real shared status-pill component (`rounded-full`, mono uppercase, modifier per status) — these colors already matched the PDF's semantic badge spec exactly, untouched by the rebrand:
- `--shipped`/`--payment-on-hold`: `bg-[#FBF0D4] text-[#7A5A11]`
- `--processing`: `bg-[#DFEEF6] text-[#1D5872]`
- `--delivered`/`--paid`: `bg-[#E4F1DA] text-[#3D6B24]`
- `--cancelled`/`--payment-failed`: `bg-[#FBE3DA] text-[#8A4526]`
- `--in-review`/`--not-paid`: `bg-[#EFF1E6] text-[#5A6653]`

Reuse `.order-badge`/`order-badge--<status>` for any new status pill rather than inventing another badge component.

**Tables** (`OrdersTable.astro` + `_my-orders.scss`): desktop table is `lg:block`/`hidden` swapped with a stacked mobile-card layout (`&--table` vs. mobile cards).

**Alerts**: error banners use `bg-[#FBEEE9] border-[#E9C4B4] text-[#8A4526]` variants (see `_change-password.scss`, `_register.scss`) — matches the badge error pair's tone.

### Icons

Inline SVGs sized per-context; color generally inherits via `currentColor`/`text-ink`/`text-offwhite`. No dedicated disabled icon color — the whole control dims instead.

### Layout & Spacing

No fixed 12-column grid — `grid-template-columns`/`repeat(auto-fit, minmax(...))` per component. Breakpoints in actual use: Tailwind's default `sm`/`lg`/`xl` (640/1024/1280px) — the PDF's claimed single 900px tier doesn't match this project's Tailwind config or usage; don't introduce it.

### Responsive Rules

Follow the existing mobile-first `sm:`/`lg:`/`xl:` pattern already used throughout (see Styling Guidelines above).

### Theme

No light/dark theme switch exists — the site is single-theme (`cream`/`ink`), and `ink`/`forest` are used as *inverse/dark-section* backgrounds (hero/CTA blocks), not a dark-mode palette. Don't build a `prefers-color-scheme`/theme-toggle path unless explicitly requested.

### Applied So Far / History

**Pass 1** (shared-foundation): `tailwind.config.js` gained `borderRadius`/`boxShadow` tokens; `_reset.scss` got one global `:focus-visible` ring replacing an input/select-only outline; `_fields.scss` extended that ring to hidden native inputs via `:has()`.

**Pass 2** (site-wide consistency audit, still the old lime-green palette): ~50 raw hex colors that exactly duplicated an existing token were swapped to the token class; `field` radius token corrected 11px→16px to match the real canonical input; `.modal-panel` converged onto `rounded-panel`; shadow tokens corrected to real source values; missing hover/focus states added to `.selectable-card` and several legacy checkbox/disclosure components.

**Pass 3 — full rebrand** (2026-09-01, explicit user decision, this pass): `tailwind.config.js` colors and `fontFamily.sans` were redefined in place — same token *names*, new hex/font values, per the PDF's palette (navy `primary #032C59`, `accent #4B8BD1`, `ink #0B1220`, `cream #F5F6F8`, etc. — see Color Tokens above) and typography (Plus Jakarta Sans replacing DM Sans, loaded via `_font-file.scss`'s Google Fonts `@import`). Because every SCSS partial already referenced colors by semantic class name, this cascaded automatically with no `.astro` or class-name changes. What still had to be hand-fixed: raw hex/`rgba(...)` literals that bypassed the semantic classes (decorative gradients in `_footer.scss`/`_get-started.scss`/`_intake.scss`/`_quiz.scss`, a handful of `bg-[#oldhex]` one-offs in `_header.scss`/`_order-details.scss`/`_order-status-modal.scss`/`_cart-sticky.scss`) — swept via grep for every old-palette hex/RGB tuple until none remained. The global focus ring and `::selection` were moved from `primary` to the new `accent` token to match the PDF's role split (primary = buttons only, accent = focus/selection) — see States above. `npm run build` (36 pages) and `build:css` both verified clean after every step.

## Styling Guidelines

- One SCSS partial per section/block in `assets/scss/components/` (`_hero.scss`, `_faq.scss`...), imported from `main.scss`.

- **Single-hyphen BEM**, not `block__element--modifier`: elements chain with `-name`, modifiers with `--name`.

```scss
@layer components {
	.auth {
		@apply flex h-screen;

		&-thumbnail-col {
			@apply w-[400px] hidden lg:flex ...;

			&-inner {
				padding: 27px 60px;
				border-radius: 10px;
			}

			.auth-image {
				@apply w-[311px];
			}
		}
	}

	// Shared styling on a different block → @extend, never two classes in markup:

	.auth-cta-alt {
		@extend .auth-image;

		@apply cursor-pointer;
	}
}
```

Block = `auth`; elements = `auth-thumbnail-col`, `auth-thumbnail-col-inner`, `auth-image`. Nest with `&-name` when structurally inside the parent; plain rule when clearer. Always wrap in `@layer components { ... }`.

- Modifier on same element: `&--name`, then target children by literal class (not `&`, which refers to the modifier itself):

```scss
.card {
	&--dark {
		.card-title {
			@apply text-offwhite;
		}
	}
}
```

- Section root class = purpose (`.hero`, `.faq`), never generic (`.section`); avoid reusing a name for an unrelated concept (final CTA is `.get-started`, not `.cta`).

- Raw CSS is fine when no Tailwind utility fits or arbitrary values get noisy.

- Interactive state → state class (`.is-open`, `.is-hidden`) toggled by JS; SCSS defines behavior. Never a Tailwind utility in a `<script>` or markup.

- Global theme (`tailwind.config.js`) for colors/spacing/fonts. Mobile-first responsive (`sm:`/`md:`/`lg:`/`xl:`/`2xl:`).

- **Tailwind v4 + JS config gotcha**: v4 doesn't auto-read `tailwind.config.js`; `build-css.mjs`'s injected `@config` directive is required or custom colors/fonts (`bg-ink`, `font-sora`) silently resolve to nothing.

- **Unknown-utility gotcha**: `@apply` hard-errors on a fake utility (e.g. `text-wrap-pretty` → should be `text-pretty`); same typo in markup would silently no-op instead — another reason `@apply`-only is safer.

## HTML Comments in the Built Output

Wrap every top-level page section: `<!-- x section start -->` / `<!-- x section end -->`.

**Gotcha**: Astro strips comments that are direct children of `<body>`'s single child. `Layout.astro` wraps `<slot />` in `<div class="page">`; `index.astro` further wraps header/footer each in their own `<div class="site-header">`/`<div class="site-footer">` — without that, comments around `<Header />`/`<Footer />` get dropped even with `compressHTML: false`. Any new top-level section outside `<main>` needs the same wrapper treatment.

## Category Pages (Dynamic Route)

8 treatment categories share one template instead of 8 files.

- `src/data/categories.ts` — typed data (`Category`, `CategoryProduct`, `CategoryFaq`); one full entry (Weight Loss) + `stubCategory()` placeholders for the rest. Fill a category by editing its entry here, no template changes.

- `src/pages/[category].astro` — `getStaticPaths()` maps each category; composes `Header`, `CategoryHero`, `ProductGrid` (×2, second with `title`/`wide` for "Suggested Products"), `Marquee`, `FaqSection`, `CtaSection`, `Footer` — same section-comment + wrapper convention as `index.astro`.

- `astro.config.mjs` → `build.format: 'file'` — required so category pages build flat (`dist/weight-loss.html`), not nested, or relative asset paths break one level too deep.

- Components: `CategoryHero.astro`, `ProductCard.astro` + `ProductGrid.astro` (shared via `wide` prop), `FaqSection.astro` (optional `faqs`/`eyebrow` props, defaults to homepage FAQ).

- Cross-page links use `index.html#programs` (not `#programs`) when linking back from a category page.

- Placeholder images: `assets/img/category-<slug>.jpg` (reused from homepage), `assets/img/product-placeholder.svg` for products until real photos exist.

## Order Confirmation Page

`src/pages/order-confirmation.astro` — static page, same `Layout` + wrapper + section-comment convention.

- `src/components/OrderConfirmation.astro` — inline dummy order data (no backend yet, mirrors `cart.astro`). Composes:
  - `CartTimeline` (existing, `active={3}`) — always reuse this stepper, never reimplement.

  - Dark collapsible order-details panel: JS toggles `.is-open` on `#order-details` + chevron; SCSS defines the state.

  - Two-column grid (next steps + customer info/good-to-know cards) + two bottom CTAs.

- `_order-confirmation.scss` — new partial. Uses `[overflow-wrap:anywhere]` on long unspaced values (emails) since grid/flex won't wrap them otherwise.

- Demo data reuses `cart.astro`'s product (`product-demo.png.png`, "Tirzemelt 20") so totals stay consistent across the Cart → Confirmation flow.

- **Known pre-existing deviation (out of scope)**: `Header.astro`'s cart icon uses `href="/cart"` (root-absolute) — should be `href="cart.html"`. Flagged, not fixed.

## Asset Management

- Location: `public/Themes/Thrivewellrx.Theme.SlimoutV2/assets/{img,icons,fonts,css,scss}`.

- No `astro:assets` optimization — anything in `public/` ships as-is. Pre-optimize (compress, WebP/AVIF) before adding.

- No external hotlinks — download images into the project.

- Reference by relative path, never import:

```astro

<img src="Themes/Thrivewellrx.Theme.SlimoutV2/assets/img/hero.jpg" alt="Hero section" />

```

- Fonts: `@font-face` in `assets/scss/base/_fonts.scss`, imported once from `main.scss`.

## Responsive Design

Test mobile (375px), tablet (768px), desktop (1024px), large (1280px+). Mobile-first; verify no breakage at any size.

## Behavior & Interactivity

- Server-side by default (`.astro`); client-side via `.tsx`/`.jsx` + `client:load`/`client:idle` when needed.

- No Claude Design editor/runtime code in production. Keep dependencies minimal.

- JS toggles state classes, never Tailwind utilities.

- Vanilla JS lives in its own file under `assets/js/`, imported from `main.js` (single entry point loaded once from `Layout.astro`); each module self-guards (e.g. `if (document.querySelector('[data-...]'))`). Example: `quiz.js`.

## Existing Features - Do Not Remove

- `Layout.astro`, `.site-header`/`.site-footer` wrappers in `index.astro`, `scripts/{build-css,watch-css,dev}.mjs`, config files (`astro.config.mjs` incl. `compressHTML: false`, `tailwind.config.js`, `tsconfig.json`).

## Before Making Changes

1. Check `src/components/` for related components first.

2. Check for an existing BEM partial in `assets/scss/components/` before writing a new one.

3. Read related pages/components to understand structure.

4. Naming: PascalCase Astro components; single-hyphen BEM classes; one class per element (`@extend`, not stacking).

5. Keep changes focused — don't touch unrelated pages/config.

## After Making Changes

- `npm run build` must pass with no errors.

- Confirm `dist/.../assets/css/style.css` has real resolved declarations (grep a class you wrote — no leftover `@apply`).

- Confirm section comments survived in `dist/index.html` if a top-level section was touched.

- If path-related: serve `dist/` in isolation (`npx serve dist`) and confirm CSS/images load.

- Check console errors, responsive layouts, broken images, TypeScript validity.

## Common Tasks

**New page**: create in `src/pages/` → import `Layout` → semantic HTML + BEM, wrapped in section comments → add/extend SCSS partial → re-check relative paths if depth differs from site root.

**New component**: create in `src/components/` (or the right subfolder) → TS props interface → root block class → matching `_blockname.scss` under `@layer components` → import from `main.scss` → `npm run build:css` (or have `npm run dev` running) → use it, wrapped in section comments.

**New image/font/icon**: pre-optimize → place under the matching `assets/{img,icons,fonts}` subfolder → reference by relative path, no import.

## Preservation Rules

- ✅ New components/SCSS partials/pages; new static assets under the theme's assets dir; modifying existing components/partials for design updates.

- ❌ Tailwind utility classes in markup (BEM + `@apply` only) · stacking two static classes (`@extend` instead) · root-absolute paths · hand-editing `style.css` · removing pages/layouts without request · changing `package.json` unless essential · adding packages without discussion · removing Tailwind/Sass/core deps · re-enabling `compressHTML` or removing `.page`/`.site-header`/`.site-footer` wrappers without understanding why (see HTML Comments).
