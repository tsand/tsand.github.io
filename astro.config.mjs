import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://tsand.github.io',
  integrations: [icon()],
  redirects: {
    '/links/github': 'https://github.com/tsand',
    '/links/linkedin': 'https://linkedin.com/in/theisensanders',
    '/links/calendar': 'https://calendar.app.google/6ffs3d3XKguYKkHS7',
  },
});
