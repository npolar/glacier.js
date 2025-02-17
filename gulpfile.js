var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('compile-js', [], function() {
	return gulp.src(['./src/glacier.js', './src/*.js', './src/**/*.js'])
	.pipe(concat('glacier.js'))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', [], function() {
	return gulp.src(['./src/glacier.js', './src/*.js', './src/**/*.js'])
	.pipe(concat('glacier.min.js'))
	.pipe(uglify({ mangle: { keep_fnames: true }, compress: { keep_fnames: true } }))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('validate-js', [], function() {
	return gulp.src(['./src/glacier.js', './src/*.js', './src/**/*.js'])
	.pipe(jshint({ multistr: true }))
	.pipe(jshint.reporter('default'));
});

gulp.task('validate', [
	'validate-js'
]);

gulp.task('test-js', ['minify-js'], function() {
	return gulp.src(['!./test/test.js', './test/glacier.js', './test/*.js', './test/**/*.js'])
	.pipe(concat('test.js'))
	.pipe(gulp.dest('./test/'))
	.pipe(mocha({ reporter: 'min' }));
});

gulp.task('test', [
	'test-js'
]);

gulp.task('watch', function() {
	gulp.watch(['./src/*', './src/**/*'], ['default']);
});

gulp.task('default', [
	'validate',
	'compile-js',
	'minify-js'
]);
