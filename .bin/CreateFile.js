"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
exports.prepend = function (str) {
    return "   \n    Created at " + util_1.now() + "\n    " + str + "\n  ";
};
var getDirPath = function (filePath) {
    if (filePath.slice(0, 2) === './') {
        return filePath.slice(2, filePath.indexOf('/'));
    }
    else if (filePath.slice(0, 3) === '../') {
        return filePath.slice(3, filePath.indexOf('/'));
    }
    return filePath.slice(0, filePath.lastIndexOf('/'));
};
exports.createFile = function (outPath, fromStr) {
    return Promise
        .resolve(util_1.makeDirRecursively(getDirPath(outPath)))
        .then(function () { return util_1.writeFile(outPath, fromStr); })
        .catch(function (e) {
        console.error('createFile Error', e);
        return Promise.reject(e);
    });
};
