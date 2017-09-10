"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yaml = require("yamljs");
var R = require("ramda");
var Promise = require("bluebird");
var clc = require("cli-color");
var util_1 = require("../util");
var insertPathInto = function (path, parent, leafValue) {
    var dirs = path.split('/');
    var key = dirs[0];
    if (dirs.length > 1) {
        parent[key] = parent[key] || {};
        return insertPathInto(path.slice(path.indexOf('/') + 1), parent[key], leafValue);
    }
    else {
        parent[key] = leafValue;
        return parent;
    }
};
var concatObjects = R.reduce(function (result, file) {
    insertPathInto(file.path, result, file.content);
    return result;
}, {});
var stripFileExtension = function (file) {
    return R.set(R.lensProp('path'), file.path.slice(0, file.path.lastIndexOf('.')), file);
};
var stripRoot = R.curry(function (rootPath, file) {
    return R.set(R.lensProp('path'), file.path.slice(rootPath.length), file);
});
var isYamlFile = function (f) {
    var ext = f.path.slice(f.path.lastIndexOf('.') + 1);
    return ext === 'yaml' || ext === 'yml';
};
var onlyYAML = R.filter(function (f) { return isYamlFile(f); });
exports.generateJSONFromYamlFiles = function (atPath) { return new Promise(function (resolve, reject) {
    console.log('Generating JSON Files from Yaml at', atPath);
    util_1.readFiles(atPath, function (files) {
        var result = concatObjects(R.map(function (f) {
            try {
                var parsed = yaml.parse(f.content);
            }
            catch (e) {
                console.log(clc.red('YAML Error:', e.message, 'at line', e.parsedLine));
                console.log(clc.white('      File: ' + f.path));
                throw 'End Error';
            }
            return R.merge(f, {
                content: parsed,
                path: R.pipe(stripFileExtension, stripRoot(atPath))(f).path
            });
        }, onlyYAML(files)));
        resolve(result);
    }, function (e) {
        console.log(clc.red('Read File Error:', e.message));
        reject(e);
    });
})
    .then(util_1.objToJson); };
