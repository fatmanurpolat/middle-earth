import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const sharedSrc = fileURLToPath(
  new URL('../../packages/shared/src/index.ts', import.meta.url),
);
const i18nSrc = fileURLToPath(
  new URL('../../packages/i18n/src/index.ts', import.meta.url),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@middleearth/shared': sharedSrc,
      '@middleearth/i18n': i18nSrc,
    },
  },
  server: {
    port: 5174,
  },
  preview: {
    port: 5174,
  },
});
