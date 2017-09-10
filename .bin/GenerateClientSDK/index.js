"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("./typescript");
exports.generateClientSDKs = function (appName) {
    return Promise.all([
        typescript_1.generate(appName),
    ]);
};
//# sourceMappingURL=index.js.map