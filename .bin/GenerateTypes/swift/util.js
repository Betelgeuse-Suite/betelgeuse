"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = function (str) {
    var hash = 5381, i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return String(hash >>> 0);
};
exports.isFloatType = function (n) {
    return !!(n && typeof n === 'number' && n % 1 !== 0);
};
