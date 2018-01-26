const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify-es').default;
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');

/* config
 ========================================================================== */

const moduleFileName = 'a11y-dialog-component';
const eslintFileName = '.eslintrc.json';
const requireClassName = 'Dialogs';

// paths
const paths = {
  entry: 'src/',
  output: 'dist/',
  app: `${moduleFileName}.js`,
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
      configFile: eslintFileName,
    }))
    .pipe(eslint.format())
);

/* build (js, es)
 ========================================================================== */

// task 'js'
gulp.task('js', ['eslint'], () => {
  browserify({
      entries: paths.entry + paths.app,
      standalone: requireClassName,
      debug: true,
    })
    .transform(babelify)
    .bundle()
    .on('error', err => {
      console.error(`${err.message}${err.codeFrame}`);
    })
    .pipe(production ? source(`${moduleFileName}.min.js`) : source(`${moduleFileName}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
    }))
    .pipe(production ? uglify() : util.noop())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.output))
});

// task 'es'
gulp.task('es', () =>
  gulp.src(paths.entry + paths.scripts)
    .pipe(rename(`${moduleFileName}.es.js`))
    .pipe(production ? uglify() : util.noop())
    .pipe(gulp.dest(paths.output))
);

// task 'build'
gulp.task('build', ['js', 'es']);

/* watch (js, es)
 ========================================================================== */

gulp.task('watch', () => {
  gulp.watch(paths.entry + paths.scripts, ['js', 'es']);
});

/* default (build)
 ========================================================================== */

gulp.task('default', ['build']);
