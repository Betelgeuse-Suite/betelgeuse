"use strict";
exports.__esModule = true;
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
var DataStore = (function () {
    function DataStore(storage) {
        this.storage = storage;
    }
    DataStore.prototype.update = function (version, data) {
        this.storage.setItem(this.KEY, JSON.stringify({
            version: toString(version),
            updated_at: (new Date()).getTime(),
            data: data
        }));
    };
    DataStore.prototype.getCurrent = function () {
        try {
            var json = JSON.parse(this.storage.getItem(this.KEY) || '');
            return {
                data: json.data,
                version: toVersion(json.version),
                updatedAt: new Date(json.updated_at)
            };
        }
        catch (e) {
            return undefined;
        }
    };
    return DataStore;
}());
var store = new DataStore(window.localStorage);
var getCurrentVersion = function () {
    return (store.getCurrent() || { version: toVersion('__CURRENT_VERSION_AT_BUILDTIME__') }).version;
};
exports.getModel = function () {
    var cached = store.getCurrent();
    if (cached) {
        return cached;
    }
    var json = require('./Data.json');
    store.update(toVersion('__CURRENT_VERSION_AT_BUILDTIME__'), json);
    return json;
};
(function (window, URL, VERSION) {
    console.log('Current version:', toString(VERSION));
    var document = window.document;
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
        window.__beetlejuice__getJSONP = function (data) {
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
        return isNewerVersion(VERSION, v) && isNonBreakingReleaseVersion(VERSION, v);
    }); };
    var getBestVersion = function (vv) {
        return sortVersionsDesc(onlyNewerAndNonBreakingVersions(vv))[0];
    };
    var versionsJsonURL = URL + '/master/versions.js';
    var getDataUrl = function (version) {
        return URL + "/v" + toString(version) + "/.bin/Data.js";
    };
    console.log('Attempting to fetch json from', versionsJsonURL);
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
            console.log('New version found:', toString(bestVersion));
            console.log('Loading', getDataUrl(bestVersion));
            getJSONP(getDataUrl(bestVersion), function (data) {
                console.log('Next Data', data);
                store.update(bestVersion, data);
            });
        }
        else {
            console.log('Nothing new! Current Version');
        }
    });
})(window, '__ENDPOINT_BASE_URL__', getCurrentVersion());
