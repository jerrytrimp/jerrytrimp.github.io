//'use strict';
//
////first install ruby and the following 2 gems or else the gulpfile wont work
////gem install scss_lint
////gem install scss_lint_reporter_checkstyle
//
////dependencies
var gulp = require('gulp');
require('gulp-grunt')(gulp);

var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var rewriteCss = require('gulp-rewrite-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylishJs = require('jshint-stylish');
var todo = require('gulp-todo');
var stripDebug = require('gulp-strip-debug');
var htmlmin = require('gulp-htmlmin');
var del = require('del');
var uncss = require('gulp-uncss');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var nano = require('gulp-cssnano');
var ngmin = require('gulp-ngmin');
var stripCssComments = require('gulp-strip-css-comments');


//vars
var angular = true;
var sourceFilesPath = 'source';
var buildFilesPath = 'build';
var sassPath = '/scss';
var cssPath = '/css';
var javascriptPath = '/js';
var imagesPath = '/img';
var fontsPath = '/fonts';

//check if using angular
if(angular == true) {
    sourceFilesPath = 'source';
    buildFilesPath = 'app/assets';
    sassPath = '/scss';
    cssPath = '/css';
    javascriptPath = '/js';
    imagesPath = '/img';
    fontsPath = '/fonts';
}

//compile sass to css
gulp.task('buildCss', function () {

    return gulp.src([sourceFilesPath+cssPath+'/*',sourceFilesPath+sassPath+'/styles.scss'])
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sass())
        .pipe(concat('styles.css'))

        .pipe(rewriteCss({destination: buildFilesPath+cssPath+'/'}))

       /* .pipe(uncss({
            html: [buildFilesPath+'/*.html']
        }))*/
        .pipe(stripCssComments({preserve: false}))
        .pipe(nano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(buildFilesPath+cssPath));
        //.pipe(browserSync.stream());
});


//checks the html files for the occurence of inline js, and lints that js
function lintAndBuildHtml() {
    return gulp.src(sourceFilesPath+'/*.html')
        .pipe(plumber())
        .pipe(jshint.extract('always'))
        .pipe(jshint())
        .pipe(jshint.reporter(stylishJs))
        //the following statment works, but breaks the url's to all resources, because it is transferred to an other folder and the url's dont correspond to that folder
        //.pipe(htmlmin({
        //    collapseWhitespace: true,
        //    removeComments: true,
        //    removeAttributeQuotes: true,
        //    removeRedundantAttributes: true,
        //    useShortDoctype: true,
        //    removeEmptyAttributes: true,
        //    removeOptionalTags: true,
        //    keepClosingSlash: true
        //}))


            .pipe(gulp.dest(buildFilesPath))

}

//lints the js files in the source/javascript directory
//function lintJs() {
//    return gulp.src([sourceFilesPath+javascriptPath+'/*.js', '!'+sourceFilesPath+javascriptPath+'/vendor/**/*'])
//        .pipe(plumber())
//        .pipe(jshint())
//        .pipe(jshint.reporter(stylishJs))
//}

//copies the font files to /fonts
gulp.task('copyFontfiles', function () {
    return gulp.src([sourceFilesPath+fontsPath+'/*'])
        .pipe(plumber())
        .pipe(gulp.dest(buildFilesPath+fontsPath))
});

//copies the bootstrap css files to /fonts
gulp.task('copyCssfiles', function () {
    return gulp.src([sourceFilesPath+cssPath+'/*.css'])
        .pipe(plumber())
        .pipe(gulp.dest(buildFilesPath+cssPath))
});


//compress images
gulp.task('compressImages', function () {
    return gulp.src(sourceFilesPath+imagesPath+'/*')
        .pipe(plumber())
        //.pipe(cache(imagemin({optimizationLevel: 5, progressive: true, interlaced: true})))
        .pipe(gulp.dest(buildFilesPath+imagesPath))
});

gulp.task('min-angular-assets-js', function () {
    return gulp.src([sourceFilesPath + javascriptPath + '/*.js',sourceFilesPath + javascriptPath + '/thirdparty/*.js'])
        .pipe(plumber())
        .pipe(concat('resources.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(buildFilesPath + javascriptPath))
});

// Build Task
//copyHtml should only be on when not using angular
gulp.task('build', function () {
    runSequence(
        'cleanProject',
        ['copyFontfiles',
        //'copyCssfiles',
        'min-angular-assets-js',
        'buildCss',
        'compressImages',
        'makeTodolist']
    )
});

// generate a to do file from html, css and js files
gulp.task('makeTodolist', function () {
    gulp.src(['app/admin/**/*.js','app/admin/**/*.html','app/website/**/*.js','app/website/**/*.html', 'app/common/*.js','app/app.js'])
        .pipe(plumber())
        .pipe(todo())
        .pipe(gulp.dest(sourceFilesPath));
});

//remove previously builded files, for use in build to live environment task
gulp.task('cleanProject', function () {
    del([buildFilesPath+cssPath,'w3cValidationErrors']);
});

//w3c validate the html files using grunt task w3c-validate
gulp.task('w3cValidate', ['grunt-default']);


// Static server
gulp.task('browserSync', ['buildCss'], function () {
    browserSync.init({
        notify: false,
        port: 3000,
        server: {
            baseDir: "./build/",
            middleware: function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }
    });

    gulp.watch(sourceFilesPath+sassPath+"/*.scss", ['buildCss']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

var angularMinFolder = 'angular-min';
var sourceFilesPath = 'source';
var appFilesPath = 'app';
var assetspath = '/assets';
var sassPath = '/scss';
var cssPath = '/css';
var javascriptPath = '/js';
var imagesPath = '/img';
var fontsPath = '/fonts';
var bowerComponentsPath = '/bower_components';

//TODO: de links naar alle assets in de html lijken gebroken te zijn...
//remove previously builded files, for use in build to live environment task
gulp.task('angular-min', function () {
    runSequence(
        'ng-clean-build-folder',
        ['ng-copy-fonts',
            'ng-build-css',
            'ng-min-html',
            'ng-min-assets-js',
            'ng-copy-angular-assets-js',
            'ng-copy-images',
            'ng-copy-bower-components',
            'ng-min-components'
            ],
        'ng-min-js',
        'ng-remove-bower-components'
    )
});

gulp.task('ng-clean-build-folder', function () {
    del(["/" + angularMinFolder]);
});

gulp.task('ng-remove-bower-components', function () {
    del([angularMinFolder+"/"+appFilesPath+"/"+bowerComponentsPath]);
});

gulp.task('ng-copy-images', function () {
    return gulp.src(sourceFilesPath + imagesPath + '/*')
        .pipe(plumber())
        .pipe(cache(imagemin({optimizationLevel: 5, progressive: true, interlaced: true})))
        .pipe(gulp.dest(angularMinFolder + "/" + appFilesPath + assetspath + imagesPath))
});
/*
gulp.task('ng-min-assets-js', function () {

    return gulp.src([sourceFilesPath + javascriptPath + '/thirdParty/*.js'])
        .pipe(plumber())
        .pipe(concat('resources.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(angularMinFolder + "/" + appFilesPath + assetspath + javascriptPath))
});*/


gulp.task('ng-min-assets-js', function () {
    return gulp.src([sourceFilesPath + javascriptPath + '/*.js',sourceFilesPath + javascriptPath + '/thirdparty/*.js'])
        .pipe(plumber())
        .pipe(concat('resources.js'))
        .pipe(uglify({mangle: false}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(/*angularMinFolder + "/" +*/ appFilesPath + assetspath + javascriptPath))
});

gulp.task('ng-min-html', function () {
    gulp.src([appFilesPath + '/**/*.html'], {base: "."})
        .pipe(plumber())
        // the following statment works, but breaks the url's to all resources, because it is transferred to an other folder and the url's dont correspond to that folder
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true,
            keepClosingSlash: true
        }))

        .pipe(gulp.dest(angularMinFolder))
});


gulp.task('ng-min-js', function ()
{
    return gulp.src([appFilesPath + "/**/*.js","!"+appFilesPath + "/"+assetspath+"/**/*.js","!"+appFilesPath+"/components/**/*.js","!"+sourceFilesPath+ javascriptPath + '/*.js'], {base: "."})
        /*.pipe(jshint.extract('always'))
         .pipe(jshint())
         .pipe(jshint.reporter(stylishJs))*/
        .pipe(plumber())
        //.pipe(concat('app.js'))
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        //.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(angularMinFolder))
});

gulp.task('ng-copy-fonts', function () {
    return gulp.src([sourceFilesPath + fontsPath + '/*.*'])
        .pipe(plumber())
        .pipe(gulp.dest(angularMinFolder + "/" + appFilesPath + assetspath + fontsPath))
});

gulp.task('ng-copy-bower-components', function () {
    return gulp.src([appFilesPath + bowerComponentsPath + '/**/*'], {base: "."})
        .pipe(plumber())
        .pipe(gulp.dest(angularMinFolder))
});

gulp.task('ng-min-components', function () {
    return gulp.src([appFilesPath + '/components/version/*.js'])
        .pipe(plumber())
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        //.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(angularMinFolder + "/" + appFilesPath+"/components/version/"))
});

gulp.task('ng-build-css', function () {
    return gulp.src([sourceFilesPath + cssPath + "/*.css", sourceFilesPath + sassPath + '/styles.scss', appFilesPath + "/**/*.css"])
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(sass())
        .pipe(concat('styles.css'))
        .pipe(rewriteCss({destination: angularMinFolder + "/" + appFilesPath + assetspath + cssPath}))
        .pipe(nano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(angularMinFolder + "/" + appFilesPath + assetspath + cssPath))
});

