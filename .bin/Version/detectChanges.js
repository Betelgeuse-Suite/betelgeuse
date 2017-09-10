"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var deep_diff_1 = require("deep-diff");
var changeTypes = {
    E: 'patch',
    N: 'minor',
    D: 'major',
};
var changeTypePriorities = {
    NONE: 0,
    E: 10,
    N: 20,
    D: 30,
};
var getChangesKind = R.reduce(function (prevKind, _a) {
    var kind = _a.kind;
    return ((changeTypePriorities[kind] > changeTypePriorities[prevKind]) ? kind : prevKind);
}, 'NONE');
exports.detectChanges = function (a, b) {
    return changeTypes[getChangesKind(deep_diff_1.diff(a, b) || [])];
};
