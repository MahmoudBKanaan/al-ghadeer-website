import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveBase } from './scripts/settings.mjs';
import { responsiveImages } from './scripts/responsive-images.mjs';

const base = resolveBase();

export default defineConfig({
  base,
  plugins: [react(), responsiveImages()],
  define: { __APP_BASE__: JSON.stringify(base) },
});
