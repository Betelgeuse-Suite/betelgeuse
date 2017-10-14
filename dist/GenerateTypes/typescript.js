"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gulp = require("gulp");
var Promise = require("bluebird");
var insert = require("gulp-insert");
var beautify = require("js-beautify");
var jsonToTsd = require('gulp-json-to-tsd');
var intercept = require('gulp-intercept');
var getAppendTemplate = function (namespace) { return "export = " + namespace + ";"; };
exports.generate = function (o) {
    return new Promise(function (resolve, reject) {
        var content = '';
        var res = gulp
            .src(o.src)
            .pipe(jsonToTsd({
            namespace: o.namespace,
        }))
            .pipe(insert.append(getAppendTemplate(o.namespace)))
            .pipe(intercept(function (file) {
            content = file.contents.toString();
            return file;
        }))
            .on('end', function () {
            resolve(content);
        })
            .on('error', reject);
    })
        .then(function (r) { return r; })
        .then(beautify);
};
