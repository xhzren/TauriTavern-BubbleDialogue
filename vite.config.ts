import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [vue()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
        fileName: () => 'index.js',
        cssFileName: 'style',
      },
      outDir: 'dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: true,
      target: 'es2022',
      rollupOptions: {
        output: {
          assetFileNames: '[name][extname]',
        },
      },
    },
  };
});
