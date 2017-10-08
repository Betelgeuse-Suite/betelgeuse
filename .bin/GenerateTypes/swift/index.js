"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var jsonToTsd = require('gulp-json-to-tsd');
var intercept = require('gulp-intercept');
var typeAnalysis_1 = require("./typeAnalysis");
var util_1 = require("../util");
var DATA_VARIABLE_NAME = 'jsonData';
exports.transform = function (json, className) {
    var CUSTOM_DEFINITIONS = {};
    var instanceProperties = R.map(function (k) {
        var type = typeAnalysis_1.getSwiftType(json[k], k, CUSTOM_DEFINITIONS);
        return {
            declaration: "public let " + k + ": " + type.name,
            typeDefinition: type.definition,
            assignment: type.assignment(k),
        };
    }, R.keys(json));
    return util_1.fromMultiline([
        "public class " + className + " {",
        '',
        util_1.indent(4)([
            R.map(function (prop) {
                if (!prop.typeDefinition) {
                    return prop.declaration;
                }
                return [
                    prop.declaration,
                    prop.typeDefinition,
                ].join('\n');
            }, instanceProperties).join('\n'),
            '',
            "init(_ " + DATA_VARIABLE_NAME + ": NSDictionary) {",
            util_1.indent(4)([
                R.map(function (prop) { return prop.assignment; }, instanceProperties).join('\n'),
            ]),
            "}",
        ]),
        "}",
    ]).join('\n');
};
var prefix = function (content) {
    return [
        'import Foundation',
        '',
        "" + content
    ].join('\n');
};
var validateAndGetJSON = function (string) {
    try {
        return JSON.parse(string);
    }
    catch (e) {
        throw new Error("Invalid JSON: \n " + string);
    }
};
exports.generate = function (json, o) {
    return prefix(exports.transform(validateAndGetJSON(json), o.namespace));
};
