"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var detectChanges_1 = require("./detectChanges");
exports.getReleaseType = function (prev, next) {
    return detectChanges_1.detectChanges(prev, next) || 'none';
};
