import { defineConfig } from 'astro/config';

const isNetlify = process.env.NETLIFY === 'true';

export default defineConfig({
  site: isNetlify ? 'https://ahmedoubali.netlify.app' : 'https://gpldroid.github.io',
  base: isNetlify ? '/' : '/ahmedoubalie',
  output: 'static',
});
