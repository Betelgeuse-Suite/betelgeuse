"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var R = require("ramda");
var betelgeuse_typescript_client_1 = require("betelgeuse-typescript-client");
var compileTpl = R.curry(function (matchers, content) {
    return R.reduce(function (result, toFind) {
        var replaceWith = matchers[toFind];
        var regex = new RegExp(toFind, 'g');
        return result.replace(regex, replaceWith);
    }, content, R.keys(matchers));
});
exports.generate = function (options) {
    var compile = compileTpl({
        '__APP_NAME__': options.appName,
        '__CURRENT_VERSION_AT_BUILDTIME__': options.repoVersion,
        '__ENDPOINT_BASE_URL__': options.endpointBaseUrl,
    });
    return Promise
        .resolve(betelgeuse_typescript_client_1.getSDKTemplates())
        .then(function (_a) {
        var js = _a.js, tsd = _a.tsd;
        return ({
            tsd: compile(tsd),
            js: compile(js),
        });
    });
};
