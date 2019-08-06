/* rollup.config.js
 ========================================================================== */

import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { eslint } from 'rollup-plugin-eslint';

const production = !process.env.ROLLUP_WATCH;
const bundle = [];

// CommonJS, suitable for Node and Browserify/Webpack
const cjs = {
  input: 'src/index.js',
  output: {
    file: 'dist/a11y-dialog-component.js',
    format: 'cjs',
    exports: 'named',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};

// Keep the bundle as an ES module file
const esm = {
  input: 'src/index.js',
  output: {
    file: 'dist/a11y-dialog-component.esm.js',
    format: 'esm',
  },
};

// A self-executing function, suitable for inclusion as a <script> tag
const iife = {
  input: 'src/index.js',
  output: {
    file: 'dist/a11y-dialog-component.min.js',
    format: 'iife',
    name: 'Dialog',
    exports: 'named',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify({
      sourcemap: true,
    }),
  ],
};

// Required for demo bundle and development environment
const demo = {
  input: 'src/index.js',
  output: {
    file: 'demos/js/a11y-dialog-component.js',
    format: 'iife',
    name: 'Dialog',
    exports: 'named',
    sourcemap: true,
  },
  watch: {
    clearScreen: false,
  },
  plugins: [
    !production && eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};

production ? bundle.push(cjs, esm, iife, demo) : bundle.push(demo);

export default bundle;
