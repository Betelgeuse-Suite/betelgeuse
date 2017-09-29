"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("./typescript");
var Promise = require("bluebird");
exports.generateClientSDKs = function (options) {
    return Promise.all([
        typescript_1.generate(options),
    ]);
};
