var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

gulp.task('compile-js', [], function() {
	return gulp.src(['./src/glacier.js', './src/*.js', './src/**/*.js'])
	.pipe(concat('glacier.js'))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', [], function() {
	return gulp.src(['./src/glacier.js', './src/*.js', './src/**/*.js'])
	.pipe(concat('glacier.min.js'))
	.pipe(uglify())
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

gulp.task('default', [
	'validate',
	'compile-js',
	'minify-js'
]);

gulp.task('watch', function() {
	gulp.watch(['./src/*', './src/**/*'], ['default']);
});

gulp.task('watch-js', function() {
	gulp.watch(['./src/**'], ['compile-js', 'minify-js']);
});
