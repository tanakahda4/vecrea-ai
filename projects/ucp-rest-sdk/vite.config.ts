import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/generated', 'src/server', 'src/client', 'src/common'],
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        generated: resolve(__dirname, 'src/generated/index.ts'),
        server: resolve(__dirname, 'src/server/index.ts'),
        client: resolve(__dirname, 'src/client/index.ts'),
        common: resolve(__dirname, 'src/common/index.ts'),
      },
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name]/index.mjs',
        },
        {
          format: 'cjs',
          entryFileNames: '[name]/index.cjs',
        },
      ],
    },
  },
});
