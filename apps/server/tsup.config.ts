import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  target: 'node20',
  noExternal: ['@meltstudio/db'],
});
