// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('lessSR5', function(cb) {
  gulp
    .src('less/sr5.less')
    .pipe(less())
    .pipe(gulp.dest("./css/"));
  cb();
});

gulp.task('lessSR6', function(cb) {
  gulp
    .src('less/sr6.less')
    .pipe(less())
    .pipe(gulp.dest("./css/"));
  cb();
});

gulp.task(
  'default',
  gulp.series('lessSR5', function(cb) {
    gulp.watch('less/*.less', gulp.series('lessSR5'));
    cb();
  })
);

