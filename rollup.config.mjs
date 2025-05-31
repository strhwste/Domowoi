import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';

export default {
  input: {
    'hausgeist-card': 'dist-ts/src/hausgeist-card.js',
    'hausgeist-card-editor': 'dist-ts/src/hausgeist-card-editor.js'
  },
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    postcss({
      inject: false,
      extract: false
    })
  ]
};