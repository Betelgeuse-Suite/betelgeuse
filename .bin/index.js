"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var shell = require("shelljs");
var Promise = require("bluebird");
var util_1 = require("./util");
var Exception_1 = require("./Exception");
var pkg = require('../package.json');
var util_2 = require("./util");
var CreateFile_1 = require("./CreateFile");
var GenerateJSON_1 = require("./GenerateJSON");
var GenerateTypes_1 = require("./GenerateTypes");
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
        console.log('Successfully generated JSON files from', srcDir, 'at', options.out);
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
        console.log('Successfully generated Typescript .tsd from', jsonFilePath, 'at', options.out);
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
var command_compile = function (repoPath) {
    var name = 'MyApp';
    var tmp = repoPath + "/tmp";
    var compiled = repoPath + "/compiled";
    Promise
        .resolve()
        .then(function () { return shell.rm('-rf', tmp); })
        .then(function () { return shell.mkdir(tmp); })
        .then(function () { return command_generateJson(repoPath + "/source", { out: tmp + "/" + name + ".json" }); })
        .then(function () { return command_generateTypes(tmp + "/" + name + ".json", { out: tmp + "/" + name + ".d.ts" }); })
        .then(function () { return getReleaseTypeFromFiles(tmp + "/" + name + ".json", compiled + "/" + name + ".json"); })
        .then(function (releaseType) {
        if (releaseType === 'none') {
            return Promise.reject(new Exception_1.NoChangesException());
        }
        return shell.exec("npm version " + releaseType);
    })
        .catch(function (e) { return console.error(e.message); });
};
commander
    .command('compile <repositoryPath>')
    .action(command_compile);
commander.parse(process.argv);
