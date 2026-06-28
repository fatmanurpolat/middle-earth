import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  // Bundle workspace deps (which export TS source) into the output so prod has no
  // unresolved internal imports. External keeps real npm deps out of the bundle.
  noExternal: [/@middleearth\//],
});
