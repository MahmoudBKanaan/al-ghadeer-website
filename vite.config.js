import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveBase } from './scripts/settings.mjs';

const base = resolveBase();

export default defineConfig({
  base,
  plugins: [react()],
  define: { __APP_BASE__: JSON.stringify(base) },
});
