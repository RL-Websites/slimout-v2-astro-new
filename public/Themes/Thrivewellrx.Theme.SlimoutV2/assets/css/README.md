# Vendor CSS only

This folder is for third-party/vendor stylesheets that need to ship as static files with zero
build processing. The project's own styles (Tailwind + BEM SCSS partials) are compiled from
`src/styles/` into the site's bundled stylesheet — do not duplicate that output here.
