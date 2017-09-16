"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var Promise = require("bluebird");
var R = require("ramda");
var compileTpl = R.curry(function (matchers, content) {
    return R.reduce(function (result, toFind) {
        var replaceWith = matchers[toFind];
        var regex = new RegExp(toFind, 'g');
        return result.replace(regex, replaceWith);
    }, content, R.keys(matchers));
});
exports.generate = function (appName) {
    var dirPath = __dirname + '/../../SDKTemplates/typescript';
    var compile = compileTpl({
        '__SAMPLE__': appName,
        '__CURRENT_VERSION__': '5.6.3',
        '__ENDPOINT_BASE_URL__': 'asdad.com'
    });
    return Promise.all([
        util_1.readFile(dirPath + '/typescript.d.ts.tpl').then(compile),
        util_1.readFile(dirPath + '/typescript.js.tpl').then(compile),
    ]);
};
