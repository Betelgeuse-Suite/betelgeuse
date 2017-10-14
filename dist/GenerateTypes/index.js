"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var typescript_1 = require("./typescript");
var swift_1 = require("./swift");
var util_1 = require("../util");
var Platform;
(function (Platform) {
    Platform[Platform["swift"] = 0] = "swift";
    Platform[Platform["typescript"] = 1] = "typescript";
})(Platform = exports.Platform || (exports.Platform = {}));
exports.generateTypes = function (jsonPath, platform) {
    var generatorsByPlatform = (_a = {},
        _a[Platform.swift] = Promise
            .resolve(util_1.readFile(jsonPath))
            .then(function (content) { return swift_1.generate(content, {
            namespace: 'Model',
        }); }),
        _a[Platform.typescript] = Promise
            .resolve()
            .then(function () { return typescript_1.generate({
            src: jsonPath,
            namespace: 'Betelgeuse',
        }); }),
        _a);
    return Promise
        .resolve(generatorsByPlatform[platform])
        .catch(function (e) {
        console.error('TypeGenerator Error', e);
    });
    var _a;
};
