"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var shell = require("shelljs");
var Promise = require("bluebird");
var Semver = require("semver");
var util_1 = require("./util");
var Exception_1 = require("./Exception");
var pkg = require('../package.json');
var util_2 = require("./util");
var CreateFile_1 = require("./CreateFile");
var GenerateJSON_1 = require("./GenerateJSON");
var GenerateTypes_1 = require("./GenerateTypes");
var GenerateClientSDK_1 = require("./GenerateClientSDK");
var Version_1 = require("./Version");
var command_generateJson = function (srcDir, options) {
    if (options === void 0) { options = {}; }
    return Promise
        .resolve(GenerateJSON_1.generateJSONFromYamlFiles(srcDir))
        .then(function (json) {
        if (typeof options.out !== 'string') {
            console.log(json);
            return Promise.resolve(json);
        }
        return CreateFile_1.createFile(options.out, json);
    })
        .then(util_1.passThrough(function () {
        if (options.out) {
            console.log('Successfully generated JSON files from', srcDir, 'at', options.out);
        }
    }));
};
var command_generateTypes = function (jsonFilePath, options) {
    if (options === void 0) { options = {}; }
    return Promise
        .resolve(GenerateTypes_1.generateTypes(jsonFilePath))
        .then(util_2.passThroughAwait(function (_a) {
        var tsd = _a[0];
        if (typeof options.out !== 'string') {
            console.log(tsd);
            return;
        }
        return util_2.writeFile(options.out, tsd);
    }))
        .then(util_1.passThrough(function () {
        if (options.out) {
            console.log('Successfully generated Typescript .tsd from', jsonFilePath, 'at', options.out);
        }
    }));
};
commander
    .version(pkg.version);
commander
    .command('generate-json <srcDir>')
    .option('--out [out]', 'Output file path')
    .action(command_generateJson);
var getReleaseTypeFromFiles = function (nextJsonPath, prevJsonPath) {
    return Promise.all([
        util_2.readFile(nextJsonPath).then(util_2.jsonToObj),
        util_2.readFile(prevJsonPath).then(util_2.jsonToObj),
    ])
        .then(function (_a) {
        var prev = _a[0], next = _a[1];
        return Version_1.getReleaseType(prev, next);
    });
};
var command_getReleaseType = function (nextJsonPath, prevJsonPath) {
    Promise
        .resolve(getReleaseTypeFromFiles(nextJsonPath, prevJsonPath))
        .then(function (release) {
        console.log('Version type:', release);
    });
};
commander
    .command('get-release-type <nextJsonPath> <prevJsonPath>')
    .action(command_getReleaseType);
commander
    .command('generate-types <jsonFilePath>')
    .option('--out [out]', 'Output directory path')
    .action(command_generateTypes);
var command_generateClientSDK = function (appName, options) {
    return Promise
        .resolve(GenerateClientSDK_1.generateClientSDKs({
        appName: appName,
        endpointBaseUrl: options.endpointBaseUrl,
        repoVersion: options.repoVersion,
    }))
        .then(function (_a) {
        var typescript = _a[0];
        var dts = typescript[0], js = typescript[1];
        if (typeof options.out !== 'string') {
            console.log(dts);
            console.log('');
            console.log(js);
            return;
        }
        return Promise.all([
            util_2.writeFile(options.out + "/beetlejuice.d.ts", dts),
            util_2.writeFile(options.out + "/beetlejuice.js", js),
        ])
            .then(function () { return undefined; });
    })
        .then(util_1.passThrough(function () {
        if (options.out) {
            console.log('Successfully generated SDKs at', options.out);
        }
    }));
};
var untrackedFiles = function () {
    return !!shell.exec('git diff --name-only').stdout;
};
var getNextVersionNumber = function (currentVersion, releaseType) {
    if (releaseType === 'none') {
        return currentVersion;
    }
    return Semver.inc(currentVersion, releaseType) || currentVersion;
};
var applyVersion = function (releaseType, AppName, repoPath) {
    var tmp = repoPath + "/tmp";
    var compiled = repoPath + "/.bin";
    return Promise
        .resolve(releaseType)
        .then(function (releaseType) {
        if (releaseType === 'none') {
            return Promise.reject(new Exception_1.NoChangesException());
        }
        return releaseType;
    })
        .then(util_1.passThrough(function (releaseType) {
        if (untrackedFiles()) {
            return Promise.reject(new Exception_1.UncommitedChanges());
        }
        shell.rm('-rf', compiled);
        shell.mkdir(compiled);
        shell.cp('-R', tmp + "/*", compiled);
        shell.rm('-rf', tmp);
    }))
        .then(util_1.passThrough(function () {
        shell.exec("git add " + compiled);
        shell.exec("git commit -m 'Beetlejuice Commit: Source Compiled.'");
    }))
        .then(function (releaseType) {
        return shell.exec("npm version " + releaseType);
    })
        .then(function () {
        return shell.exec('git push origin master; git push --tags');
    });
};
commander
    .command('generate-client-sdks <AppName>')
    .option('--out [out]', 'Output directory path')
    .option('--repo-version <repoVersion>', 'Repo Version')
    .option('--endpoint-base-url <endpointBaseUrl>', 'The endpoint base url')
    .action(command_generateClientSDK);
var APP_NAME = 'MyApp';
var command_compile = function (repoPath) {
    var AppName = APP_NAME;
    var compiled = process.cwd() + "/" + repoPath + "/.bin";
    var tmp = process.cwd() + "/" + repoPath + "/tmp";
    var repoPackage = require(process.cwd() + "/" + repoPath + "/package.json");
    return Promise
        .resolve()
        .then(function () {
        shell.rm('-rf', tmp);
        shell.mkdir(tmp);
    })
        .then(function () { return command_generateJson(repoPath + "/source", { out: tmp + "/" + AppName + ".json" }); })
        .then(function () { return command_generateTypes(tmp + "/" + AppName + ".json", { out: tmp + "/" + AppName + ".d.ts" }); })
        .then(function () { return getReleaseTypeFromFiles(tmp + "/" + AppName + ".json", compiled + "/" + AppName + ".json"); })
        .then(util_2.passThroughAwait(function (releaseType) { return command_generateClientSDK(AppName, {
        out: tmp,
        repoVersion: getNextVersionNumber(repoPackage.version, releaseType),
        endpointBaseUrl: repoPackage.cdn,
    }); }))
        .then(function (releaseType) { return applyVersion(releaseType, AppName, repoPath); })
        .catch(function (e) { return console.error(e.message); });
};
var command_compile_sdk = function (repoPath) {
    var AppName = APP_NAME;
    var compiled = process.cwd() + "/" + repoPath + "/.bin";
    var repoPackage = require(process.cwd() + "/" + repoPath + "/package.json");
    return Promise
        .resolve(command_generateClientSDK(AppName, {
        out: compiled,
        repoVersion: repoPackage.version,
        endpointBaseUrl: repoPackage.cdn,
    }))
        .catch(function (e) { return console.error(e.message); });
};
commander
    .command('compile <repositoryPath>')
    .action(command_compile);
commander
    .command('compile-sdks <repositoryPath>')
    .action(command_compile_sdk);
commander.parse(process.argv);
