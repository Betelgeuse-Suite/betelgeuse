"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var pkg = require('../package.json');
var util_1 = require("./util");
var CreateFile_1 = require("./CreateFile");
var GenerateJSON_1 = require("./GenerateJSON");
var GenerateTypes_1 = require("./GenerateTypes");
var Version_1 = require("./Version");
var command_generateJson = function (srcDir, options) {
    if (options === void 0) { options = {}; }
    Promise
        .resolve(GenerateJSON_1.generateJSONFromYamlFiles(srcDir))
        .then(function (json) {
        if (typeof options.out !== 'string') {
            console.log(json);
            return;
        }
        CreateFile_1.createFile(options.out, json);
    });
};
var command_generateTypes = function (jsonFilePath, options) {
    if (options === void 0) { options = {}; }
    Promise
        .resolve(GenerateTypes_1.generateTypes(jsonFilePath))
        .then(function (json) {
        console.log('generate json', json[0]);
    });
};
commander
    .version(pkg.version);
commander
    .command('generate-json <srcDir>')
    .option('--out [out]', 'Output file path')
    .action(command_generateJson);
commander
    .command('get-release-type <nextJsonPath> <prevJsonPath>')
    .action(function (next, prev) {
    Promise.all([
        util_1.readFile(prev).then(util_1.jsonToObj),
        util_1.readFile(next).then(util_1.jsonToObj),
    ])
        .then(function (_a) {
        var prev = _a[0], next = _a[1];
        return Version_1.getReleaseType(prev, next);
    })
        .then(function (release) {
        console.log('Version type:', release);
    });
});
commander
    .command('generate-types <jsonFilePath>')
    .option('--out [out]', 'Output directory path')
    .action(command_generateTypes);
commander.parse(process.argv);
