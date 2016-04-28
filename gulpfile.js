var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var tsify = require('tsify');
var tap = require('gulp-tap');
var buffer = require('gulp-buffer');
var rename = require('gulp-rename');
var partialify = require('partialify/custom');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

// !!! src path if begin with ./ will NOT trigger added event
var configs = {
    lib: {
        src: ['lib/**/*'],
        build: 'build/lib',
        release: 'release/lib'
    },
    jade: {
        src: ['src/jade/**/*.jade', '!src/jade/**/_*.jade'],
        build: 'build',
        release: 'release'
    },
    ts: {
        src: ['src/ts/**/*.ts', '!src/ts/**/_*.ts'],
        build: 'build/script',
        release: 'release/script'
    },
    sass: {
        src: ['src/sass/**/*.sass', '!src/sass/**/_*.sass'],
        build: 'build/css',
        release: 'release/css',

        releaseConfigs: { outputStyle: 'compressed' }
    },
    html: {
        src: ['src/jade/**/*.html', '!src/jade/**/_*.html'],
        build: 'build',
        release: 'release'
    },
    css: {
        src: ['src/sass/**/*.css', '!src/sass/**/_*.css'],
        build: 'build/css',
        release: 'release/css'
    },
    js: {
        src: ['src/ts/**/*.js', '!src/ts/**/_*.js'],
        build: 'build/script',
        release: 'release/script'
    }
};

gulp.task('clean', function () {
    return del('build/**/*')
});

gulp.task('sass', function () {
    return gulp.src(configs.sass.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(configs.sass.build));
});

gulp.task('ts', function () {
    return gulp.src(configs.ts.src, { read: false })
        .pipe(tap(function (file) {
            file.contents = browserify(file.path)
                .plugin(tsify)
                .transform(partialify.alsoAllow('tpl'))
                .bundle()
                .on('error', function (error) {
                    console.error(error.toString());
                });
        }))
        .pipe(buffer())
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(configs.ts.build));
});

gulp.task('jade', function () {
    return gulp.src(configs.jade.src)
        .pipe(jade())
        .on('error', function (error) {
            console.warn(error)
            
            this.emit('end');
        })
        .pipe(gulp.dest(configs.jade.build));
});

gulp.task('regular', function () {
    return merge(
        gulp.src(configs.html.src).pipe(gulp.dest(configs.html.build)),
        gulp.src(configs.css.src).pipe(gulp.dest(configs.css.build)),
        gulp.src(configs.js.src).pipe(gulp.dest(configs.js.build))
    );
});

gulp.task('lib', function () {
    return gulp.src(configs.lib.src).pipe(gulp.dest(configs.lib.build));
});

// register watch task
['lib', 'sass', 'ts', 'jade', 'regular'].forEach(function (task) {
    gulp.task(task + '-watch', [task], function (event) {
        console.log(event);
        browserSync.reload();
    });
});

gulp.task('default', function () {
    runSequence(
        'clean',
        ['lib', 'sass', 'ts', 'jade', 'regular'],
        function (error) {
            if (error) {
                consol.warn(error)
            } else {
                browserSync({
                    server: {
                        baseDir: './build'
                    }
                });

                ['lib', 'sass', 'ts', 'jade'].forEach(function (task) {
                    gulp.watch(configs[task].src, [task + '-watch']);
                });
                var regular_files = [],
                    push_src = function (src) {
                        if ('string' == typeof src) {
                            src = [src];
                        }

                        Array.prototype.push.apply(regular_files, src);
                    };
                push_src(configs.html.src);
                push_src(configs.css.src);
                push_src(configs.js.src);
                gulp.watch(regular_files, ['regular-watch']);
            }
        }
    );
});
