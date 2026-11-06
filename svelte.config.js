import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// Renders the kb as static HTML: the pages as the desk sees them.
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: './src/lib/layouts/runbook.svelte' } })],
  kit: {
    adapter: adapter({ pages: 'rendered', assets: 'rendered' }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb', '/kb/incidents/4471-split'] },
  },
};
