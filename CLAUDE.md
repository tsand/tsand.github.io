# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start dev server at localhost:4321
pnpm build    # Build static site to ./dist
pnpm preview  # Preview production build locally
```

## Architecture

This is a personal portfolio site built with **Astro** and deployed to GitHub Pages.

**Key technologies:**

-   Astro with static output (no SSR)
-   Tailwind CSS v4 via PostCSS
-   astro-icon with Iconify for icons (@iconify-json/fa-brands)
-   Sharp for image optimization

**Project structure:**

-   `src/layouts/Layout.astro` - Base HTML layout with meta tags
-   `src/pages/index.astro` - Single page portfolio
-   `src/styles/global.css` - Tailwind imports and custom CSS (glassmorphism, animations)
-   `src/assets/` - Images processed by Astro's Image component
-   `public/fonts/` - Self-hosted Geist font files (woff2)

**Deployment:**

-   Pushes to `main` trigger GitHub Actions workflow (`.github/workflows/astro.yml`)
-   Builds and deploys to GitHub Pages automatically
