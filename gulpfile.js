import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import cleanCSS from 'gulp-clean-css';
import consola from 'consola';
import rename from 'gulp-rename';

const { src, watch, dest, series, parallel } = gulp;

const __dirname = dirname(fileURLToPath(import.meta.url));
const distBundle = resolve(__dirname, './dist');
const demoRoot = resolve(__dirname, './demo');
const moduleRoot = resolve(__dirname, './src');
const moduleInput = resolve(moduleRoot, 'index.js');
const demoInput = resolve(moduleRoot, 'demo.js');
const themeInput = resolve(moduleRoot, 'assets/style/index.less');

const buildTheme = () => {
  const postcssPlugins = [
    autoprefixer(),
    pxtorem({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['*-origin'],
    }),
  ];
  return src(themeInput)
    .pipe(less())
    .pipe(postcss(postcssPlugins))
    .pipe(
      cleanCSS({}, (details) => {
        consola.success(
          `${details.name}: ${details.stats.originalSize / 1000} KB -> ${details.stats.minifiedSize / 1000} KB`
        );
      })
    )
    .pipe(
      rename((p) => {
        p.dirname = '';
      })
    )
    .pipe(dest(distBundle));
};

const buildModule = async () => {
  const bundle = await rollup({
    input: moduleInput,
    external: [/^quill/],
    treeshake: true,
    plugins: [
      commonjs(),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
      }),
      terser(),
    ],
  });
  return bundle.write({
    file: resolve(distBundle, 'index.js'),
    format: 'es',
    sourcemap: true,
  });
};
const buildDemo = async () => {
  const bundle = await rollup({
    input: demoInput,
    treeshake: true,
    plugins: [commonjs()],
    output: {
      globals: {
        quill: 'Quill',
      },
    },
  });
  return bundle.write({
    file: resolve(demoRoot, 'demo.js'),
    format: 'iife',
    sourcemap: true,
  });
};
const build = parallel(buildTheme, series(buildModule, buildDemo));

export const module = buildModule;
export const demo = buildDemo;
export const dev = () => {
  watch('./src/**/*.js', series(buildModule, buildDemo));
  watch('./src/**/*.less', buildTheme);
};
export default build;
