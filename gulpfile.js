const gulp = require("gulp");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");

// CSS Minify
gulp.task("css", () => {
    return gulp.src("style.css")
        .pipe(cssnano())
        .pipe(gulp.dest("dist"));
});

// JS Minify
gulp.task("js", () => {
    return gulp.src("app.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist"));
});

// Image Optimize
gulp.task("images", () => {
    return gulp.src("assets/*")
        .pipe(imagemin())
        .pipe(gulp.dest("dist/assets"));
});

// Default
gulp.task("default", gulp.parallel("css", "js", "images"));