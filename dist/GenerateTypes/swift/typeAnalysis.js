"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var lodash_1 = require("lodash");
var util_1 = require("./util");
var swift_1 = require("./swift");
var index_1 = require("./index");
var DATA_VARIABLE_NAME = 'jsonData';
exports.getSwiftType = function (value, key, definitions) {
    var assignPrimitives = R.curry(function (typeName, k) {
        return "self." + k + " = " + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! " + typeName;
    });
    if (value == null || typeof value === 'undefined') {
        var name = 'NSNull';
        return {
            name: name,
            class: swift_1.TypeClass.primitive,
            definition: '',
            assignment: assignPrimitives(name),
            hash: name,
        };
    }
    else if (typeof value === 'number') {
        if (util_1.isFloatType(value)) {
            var name = 'Float';
            return {
                name: name,
                class: swift_1.TypeClass.primitive,
                definition: '',
                assignment: assignPrimitives(name),
                hash: name,
            };
        }
        else {
            var name = 'Int';
            return {
                name: name,
                class: swift_1.TypeClass.primitive,
                definition: '',
                assignment: assignPrimitives(name),
                hash: name,
            };
        }
    }
    else if (typeof value === 'string') {
        var name = 'String';
        return {
            name: name,
            definition: '',
            class: swift_1.TypeClass.primitive,
            assignment: assignPrimitives(name),
            hash: name,
        };
    }
    else if (typeof value === "boolean") {
        var name = 'Bool';
        return {
            name: name,
            definition: '',
            class: swift_1.TypeClass.primitive,
            assignment: assignPrimitives(name),
            hash: name,
        };
    }
    else if (lodash_1.isArray(value)) {
        if (value.length === 0) {
            var name_1 = '[NSNull]';
            return {
                name: name_1,
                class: swift_1.TypeClass.array,
                definition: '',
                assignment: function (k) { return "self." + k + " = " + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! " + name_1; },
                hash: 'array',
            };
        }
        return getCommonType(value, key, definitions);
    }
    else if (typeof value === 'object') {
        var hash_1 = exports.hashObject(value, definitions);
        if (!!definitions[hash_1]) {
            var name_2 = definitions[hash_1].name;
            return {
                name: name_2,
                class: swift_1.TypeClass.object,
                assignment: function (k) { return "self." + k + " = " + name_2 + "(" + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! NSDictionary)"; },
                hash: hash_1,
                definition: '',
            };
        }
        else {
            var name_3 = lodash_1.upperFirst(key);
            definitions[hash_1] = {
                definition: index_1.transform(value, name_3),
                name: name_3,
            };
            return {
                name: definitions[hash_1].name,
                class: swift_1.TypeClass.object,
                definition: definitions[hash_1].definition,
                assignment: function (k) { return "self." + k + " = " + name_3 + "(" + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! NSDictionary)"; },
                hash: hash_1,
            };
        }
    }
    else {
        var name = 'Any';
        return {
            name: name,
            class: swift_1.TypeClass.primitive,
            definition: '',
            assignment: assignPrimitives(name),
            hash: name,
        };
    }
};
var getCommonType = function (arrayOfValues, key, definitions) {
    var getSwiftTypeOfKey = function (v) { return exports.getSwiftType(v, key, definitions); };
    var uniqHashes = R.pipe(R.map(getSwiftTypeOfKey), R.uniqBy(function (t) { return t.hash; }))(arrayOfValues);
    if (uniqHashes.length === 1) {
        var type = uniqHashes[0];
        var name_4 = "[" + type.name + "]";
        return {
            name: name_4,
            class: swift_1.TypeClass.array,
            definition: type.definition,
            assignment: function (k) { return "self." + k + " = " + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! " + name_4; },
            hash: "[" + type.hash + "]",
        };
    }
    else {
        var name_5 = "[Any]";
        return {
            name: name_5,
            class: swift_1.TypeClass.array,
            definition: '',
            assignment: function (k) { return "self." + k + " = " + DATA_VARIABLE_NAME + "[\"" + k + "\"] as! " + name_5; },
            hash: name_5,
        };
    }
};
exports.hashObject = function (o, definitions) {
    return R.pipe(R.sortBy(R.toLower), R.map(function (k) { return k + ':' + exports.getSwiftType(o[k], k, definitions).hash; }), function (keyTypePairs) { return keyTypePairs.join(''); }, util_1.hash)(R.keys(o));
};
