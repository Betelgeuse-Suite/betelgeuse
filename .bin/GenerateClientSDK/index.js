"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var typescript_1 = require("./typescript");
exports.generateClientSDKs = function (options) {
    return Promise.all([
        typescript_1.generate(options),
    ]);
};
