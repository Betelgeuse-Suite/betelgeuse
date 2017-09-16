"use strict";
exports.__esModule = true;
var json = require('./__SAMPLE__.json');
exports.getModel = function () { return json; };
var __CURRENT_VERSION__ = '2.0.0';
var __ENDPOINT_URL__ = 'https://rawgit.com/GabrielCTroia/beetlejuice-sample-repo1';
var window = global;
(function (global, document, URL, VERSION) {
    console.log('Current version:', VERSION);
    var toVersion = function (v) {
        if (isValidStringVersion(v)) {
            throw "The given string: " + v + " is not a valid version!";
        }
        var _a = v.split('.'), major = _a[0], minor = _a[1], patch = _a[2];
        return {
            major: Number(major),
            minor: Number(minor),
            patch: Number(patch)
        };
    };
    var isValidStringVersion = function (v) {
        var _a = v.split('.'), major = _a[0], minor = _a[1], patch = _a[2];
        return !(isNumeric(major) && isNumeric(minor) && isNumeric(patch));
    };
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var toString = function (v) {
        v = v || {};
        return v.major + "." + v.minor + "." + v.patch;
    };
    var compareVersions = function (vA, vB) {
        if (isEqualVersion(vA, vB)) {
            return 0;
        }
        else if (isNewerVersion(vA, vB)) {
            return -1;
        }
        return 1;
    };
    var isEqualVersion = function (vA, vB) {
        return vA.major === vB.major
            && vA.minor === vB.minor
            && vA.patch === vB.patch;
    };
    var isNewerVersion = function (vA, vB) {
        return vB.major > vA.major
            || vB.major === vA.major && vB.minor > vA.minor
            || vB.major === vA.major && vB.minor === vA.minor && vB.patch > vA.patch;
    };
    var isNonBreakingReleaseVersion = function (vA, vB) {
        return vA.major === vB.major;
    };
    var getJSONP = function (url, success) {
        var script = document.createElement('script'), head = document.getElementsByTagName('head')[0]
            || document.documentElement;
        global['__beetlejuice__getVersions'] = function (data) {
            head.removeChild(script);
            success && success(data);
        };
        script.src = url;
        head.appendChild(script);
    };
    var sortVersionsDesc = function (vv) {
        if (vv === void 0) { vv = []; }
        return vv.sort(function (a, b) { return compareVersions(b, a); });
    };
    var onlyNewerAndNonBreakingVersions = function (vv) { return vv
        .filter(function (v) {
        return isNewerVersion(version, v) && isNonBreakingReleaseVersion(version, v);
    }); };
    var getBestVersion = function (vv) {
        return sortVersionsDesc(onlyNewerAndNonBreakingVersions(vv))[0];
    };
    var version = toVersion(VERSION);
    var versionsJsonURL = URL + '/master/versions.js';
    console.log('Attempting to get', versionsJsonURL);
    getJSONP(versionsJsonURL, function (data) {
        console.log('Versions JSON data', data);
        var allVersions = Object
            .keys(data)
            .map(toVersion);
        allVersions.forEach(function (v) {
            console.log(toString(v));
        });
        var bestVersion = getBestVersion(allVersions);
        if (bestVersion) {
            console.log('Best Version:', toString(bestVersion));
        }
        else {
            console.log('Nothing new!');
        }
    });
})(window, window.document, __ENDPOINT_URL__, __CURRENT_VERSION__);
