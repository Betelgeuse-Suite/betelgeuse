"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var tsd_generator_1 = require("./tsd.generator");
exports.generateTypes = function (jsonPath) {
    return Promise
        .all([
        tsd_generator_1.generate({
            src: jsonPath,
            namespace: 'Beetlejuice',
        })
    ])
        .catch(function (e) {
        console.error('TypeGenerator Error', e);
    });
};
