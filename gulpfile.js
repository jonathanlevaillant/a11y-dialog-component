const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');

/* config
 ========================================================================== */

// file name
const file = 'a11y-dialog-component';

// paths
const paths = {
  entry: 'src/',
  output: 'dist/',
  app: `${file}.js`,
  scripts: '**/*.js',
};

// environments
const production = !!util.env.env;

/* linter (eslint)
 ========================================================================== */

// task 'eslint'
gulp.task('eslint', () =>
  gulp.src(paths.entry + paths.scripts)
    .pipe(eslint({
      configFile: '.eslintrc.json',
    }))
    .pipe(eslint.format())
);

/* build (js, es6)
 ========================================================================== */

// task 'js'
gulp.task('js', ['eslint'], () => {
  browserify({
      entries: paths.entry + paths.app,
      debug: true,
    })
    .transform('babelify')
    .bundle()
    .on('error', err => {
      console.error(`${err.message}${err.codeFrame}`);
    })
    .pipe(production ? source(`${file}.min.js`) : source(`${file}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
    }))
    .pipe(production ? uglify() : util.noop())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.output))
});

// task 'es6'
gulp.task('es6', () =>
  gulp.src(paths.entry + paths.scripts)
    .pipe(rename(`${file}.es6.js`))
    .pipe(gulp.dest(paths.output))
);

// task 'build'
gulp.task('build', ['js', 'es6']);

/* watch (js, es6)
 ========================================================================== */

gulp.task('watch', () => {
  gulp.watch(paths.entry + paths.scripts, ['js', 'es6']);
});

/* default (build)
 ========================================================================== */

gulp.task('default', ['build']);
