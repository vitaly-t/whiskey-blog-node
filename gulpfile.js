'use strict';

const gulp = require('gulp'),
      pump = require('pump'),
      del = require('del'),
      newer = require('gulp-newer'),
      sourcemaps = require('gulp-sourcemaps'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      sass = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      imageOptim = require('gulp-imageoptim');


// files we're going to be looking at
const srcDir = 'public/static/src/',
      distDir = 'public/static/dist/',
      jsFiles = [
        srcDir + 'js/polyfills.js',
        srcDir + 'js/lodash.min.js',
        srcDir + 'js/scripts.js'
      ],
      sassFiles = srcDir + 'sass/**/*.scss',
      sassMainFile = srcDir + 'sass/public.scss',
      cssFiles = srcDir + 'style/*.css',
      imageFiles = srcDir + 'images/*';


// high-level catagories
gulp.task('default', ['css', 'js', 'images']);
gulp.task('js', ['js:main']);
gulp.task('css', ['css:prefix']);
gulp.task('images', ['images:optimize']);


// high-level watchers
gulp.task('watch', ['css:watch', 'js:watch', 'images:watch']);
gulp.task('css:watch', ['css:sass:watch', 'css:prefix:watch']);
gulp.task('js:watch', ['js:main:watch']);
gulp.task('images:watch', ['images:optimize:watch']);


// javascript tasks
gulp.task('js:main', function (done) {
  pump(
    [
      gulp.src(jsFiles),
      sourcemaps.init(),
      concat('scripts.min.js'),
      uglify({ mangle: false }),
      sourcemaps.write('../../maps'),
      gulp.dest(distDir + 'js')
    ],
    done
  );
});
gulp.task('js:main:watch', function () {
  gulp.watch(jsFiles, ['js:main'])
})


// css tasks
gulp.task('css:sass', function (done) {
  pump(
    [
      gulp.src(sassMainFile),
      sourcemaps.init(),
      sass({
        outputStyle: 'expanded'
      }),
      sourcemaps.write('../../maps'),
      gulp.dest(srcDir + 'style')
    ],
    done
  );
});
gulp.task('css:sass:watch', function () {
  gulp.watch(sassFiles, ['css:sass']);
});

gulp.task('css:prefix', ['css:sass'], function (done) {
  pump(
    [
      gulp.src(cssFiles),
      sourcemaps.init(),
      postcss(
        [
          autoprefixer({
            browsers: ['last 4 versions', '>= 3%', '>= 0.8% in US', 'ie >= 8']
          })
        ]
      ),
      sourcemaps.write('../../maps'),
      gulp.dest(distDir + 'style')
    ],
    done
  );
});
gulp.task('css:prefix:watch', function () {
  gulp.watch(cssFiles, ['css:prefix']);
});


// image tasks
gulp.task('images:optimize', function (done) {
  let out = distDir + 'images';
  pump(
    [
      gulp.src(imageFiles),
      newer(out),
      imageOptim.optimize(),
      gulp.dest(out)
    ],
    done
  );
});
gulp.task('images:optimize:watch', function () {
  let watcher = gulp.watch(imageFiles, ['images:optimize']);
  watcher.on('change', function(ev){
    if (ev.type === 'deleted'){
      del(ev.path.replace('/src/', '/dist/'))
        .then(files => console.log('Deleted ' + files.join(', ')));
    }
  })
});
