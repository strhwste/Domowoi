import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'dist-ts/src/hausgeist-card.js',
  output: {
    file: 'dist/hausgeist-card.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true,
    preserveModules: false
  },
  context: 'window',
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: 'node_modules/**',
      transformMixedEsModules: true
    }),
    json(),
    postcss({
      inject: false,
      extract: false
    })
  ]
};