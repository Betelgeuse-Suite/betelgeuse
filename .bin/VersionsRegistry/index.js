"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require("shelljs");
var gitTags = require('git-tags');
var Promise = require("bluebird");
var util_1 = require("../util");
var R = require("ramda");
var beautify = require("js-beautify");
var getTags = function () { return new Promise(function (resolve, reject) {
    gitTags.get(function (error, tags) {
        if (error) {
            reject(error);
            return;
        }
        resolve(tags);
    });
})
    .then(function (tags) { return tags; })
    .then(R.map(trimPrefix)); };
var trimPrefix = function (v) { return v.replace('v', ''); };
var listToObject = function (list) {
    return R.reduce(function (obj, item) {
        obj[item] = '';
        return obj;
    }, {}, list);
};
var getFileContentJSON = function (vv) {
    return R.pipe(JSON.stringify, beautify)(vv);
};
var getFileContentJS = function (vv) {
    return R.pipe(getFileContentJSON, function (json) { return "__beetlejuice__getVersions(" + json + ");"; })(vv);
};
exports.updateVesionRegistry = function (repoPath) {
    var versionFiles = {
        js: repoPath + "/versions.js",
        json: repoPath + "/versions.json",
    };
    return Promise
        .resolve(shell.exec('git pull --tags origin'))
        .then(function () { return getTags(); })
        .then(listToObject)
        .then(function (versions) { return [
        getFileContentJS(versions),
        getFileContentJSON(versions),
    ]; })
        .then(function (_a) {
        var js = _a[0], json = _a[1];
        return Promise.all([
            util_1.writeFile(versionFiles.js, js),
            util_1.writeFile(versionFiles.json, json),
        ]);
    });
};
