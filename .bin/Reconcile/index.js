"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var Promise = require("bluebird");
var clc = require("cli-color");
var jsBeautify = require("js-beautify");
var util_1 = require("../util");
exports.reconcile = function (prevJson, currentJson) {
    return Promise
        .resolve(R.merge(util_1.jsonToObj(prevJson), util_1.jsonToObj(currentJson)))
        .then(function (merged) { return JSON.stringify(merged); })
        .then(jsBeautify)
        .catch(function (e) {
        console.error(clc.yellow(e.toString()));
    });
};
