"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var semver = require("semver");
var Exception_1 = require("../Exception");
var detectChanges_1 = require("./detectChanges");
exports.getReleaseType = function (prev, next) {
    return detectChanges_1.detectChanges(prev, next) || 'none';
};
exports.getNextVersion = function (prev, next) { return semver.inc(prev.__version, detectChanges_1.detectChanges(R.omit(['__version'], prev), next) || 'none'); };
exports.applyVersion = function (prev, next) {
    var nextVersion = exports.getNextVersion(prev, next);
    if (nextVersion === null) {
        throw new Exception_1.NoChangesException();
    }
    return R.merge(next, { __version: nextVersion });
};
