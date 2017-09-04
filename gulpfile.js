"use strict";

const jsonToTsd = require('gulp-json-to-tsd');

var gulp = require("gulp");
gulp.task('default', function () {
    gulp.src('./mocks/prev.json')
        .pipe(jsonToTsd({
            namespace: 'Beetlejuice',
            declareVariable: 'Prev',
        }))
        .pipe(gulp.dest('mocks'));
});