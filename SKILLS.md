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
