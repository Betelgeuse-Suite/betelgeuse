"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
exports.toType = R.curry(function (type, key) {
    return "\"" + key + "\": " + type + ";";
});
exports.indent = R.curry(function (spaces, lines) {
    var indentation = R.map(function () { return ' '; }, R.range(0, spaces)).join('');
    return R.map(function (line) {
        return R.map(function (split) { return indentation + split; }, line.split('\n')).join('\n');
    }, lines).join('\n');
});
exports.toMultiline = function (blob) {
    var split = blob.split('\n');
    if (split.length < 2) {
        return split;
    }
    return R.map(exports.toMultiline, split);
};
exports.fromMultiline = function (lines) {
    if (typeof lines === 'string') {
        return R.flatten(exports.toMultiline(lines));
    }
    return R.flatten(exports.toMultiline(lines.join('\n')));
};
