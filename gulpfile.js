import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import cleanCSS from 'gulp-clean-css';
import consola from 'consola';
import rename from 'gulp-rename';

const { src, watch, dest, task, parallel, series } = gulp;

const __dirname = dirname(fileURLToPath(import.meta.url));
const distBundle = resolve(__dirname, './dist');
const docsRoot = resolve(__dirname, './docs');
const moduleRoot = resolve(__dirname, './src');
const moduleInput = resolve(moduleRoot, 'index.js');
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
      terser(),
    ],
  });
  await Promise.all(
    [resolve(distBundle, 'index.umd.js'), resolve(docsRoot, 'index.umd.js')].map(
      file => bundle.write({
        file,
        format: 'umd',
        sourcemap: true,
        name: 'QuillEasyColor',
        exports: 'named',
        globals: {
          quill: 'Quill',
        },
      })
    )
  )
  return bundle.write({
    file: resolve(distBundle, 'index.js'),
    format: 'es',
    sourcemap: true,
  });
};

const copyTheme = () => src(resolve(distBundle, './*.css')).pipe(dest(docsRoot));
const theme = series(buildTheme, copyTheme)
const build = parallel(theme, buildModule);
const dev = () => {
  watch('./src/**/*.js', buildModule);
  watch('./src/**/*.less', theme);
};
task('dev', dev);
task('default', build);

