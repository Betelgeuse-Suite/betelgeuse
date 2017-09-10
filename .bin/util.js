"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Promise = require("bluebird");
var beautify = require("js-beautify");
var mkdirp = require("mkdirp");
exports.readFile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, 'utf-8', function (err, content) {
            if (err) {
                reject(err);
            }
            else {
                resolve(content);
            }
        });
    })
        .then(function (s) { return s; });
};
exports.readJSONFile = function (path) { return Promise.resolve(exports.readFile(path)); };
exports.jsonToObj = function (s) {
    if (typeof s === 'string') {
        return JSON.parse(s);
    }
    throw s + " is not a Valid JSON!";
};
exports.objToJson = function (o) {
    return beautify(JSON.stringify(o));
};
exports.writeFile = function (path, content) { return new Promise(function (resolve, reject) {
    fs.writeFile(path, content, function (err) {
        if (err) {
            reject(err);
        }
        else {
            resolve();
        }
    });
})
    .then(function () { return undefined; }); };
exports.readFiles = function (dirname, onDone, onError) {
    var files = [];
    if (dirname && dirname.slice(-1) !== '/') {
        dirname += '/';
    }
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        var pending = filenames.length;
        if (!pending) {
            onDone(files);
            return;
        }
        filenames.forEach(function (filename) {
            var path = dirname + filename;
            if (fs.lstatSync(path).isDirectory()) {
                return exports.readFiles(path + '/', function (nestedFiles) {
                    files = files.concat(nestedFiles);
                    if (!--pending) {
                        onDone(files);
                    }
                }, onError);
            }
            else {
                fs.readFile(path, 'utf-8', function (err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    files.push({ path: path, content: content });
                    if (!--pending) {
                        onDone(files);
                    }
                });
            }
        });
    });
};
exports.makeDirRecursively = function (path) {
    return new Promise(function (resolve, reject) {
        mkdirp(path, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
exports.passThrough = function (fn) { return function (arg) {
    return Promise.resolve(fn.call(fn, arg)).then(function () { return arg; });
}; };
exports.passThroughAwait = function (fn) { return function (arg) {
    return Promise.resolve(fn.call(fn, arg)).then(function () { return arg; });
}; };
exports.now = function () { return new Date().getTime(); };
//# sourceMappingURL=util.js.map