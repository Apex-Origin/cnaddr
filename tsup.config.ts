import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  target: 'es2021',
  dts: { entry: { index: 'src/index.ts' } },
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
