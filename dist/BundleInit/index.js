'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require("shelljs");
var Promise = require("bluebird");
var prompt = require('prompt');
var sh = shell;
var ShellString = sh.ShellString;
var srcYaml = "\n# This is your very first source file.\n# If you don't know what a YAML file, go to '\n#   http://docs.ansible.com/ansible/latest/YAMLSyntax.html for a quick intro;\n\nindex:\n";
var getBetelgeuseJson = function (name, cdn) { return "\n{\n  \"name\": \"" + name + "\",\n  \"cdn\": \"" + cdn + "\",\n  \"version\": \"0.0.0\"\n}\n"; };
var startPrompt = function (question) {
    prompt.start();
    return new Promise(function (resolve, reject) {
        prompt.get(question, function (err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};
var escapeShell = function (cmd) {
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
};
exports.bundleInit = function (bundleName) {
    console.log("Initializing " + bundleName);
    startPrompt({
        properties: {
            cdn: {
                message: 'Where will the Bundle be hosted (ex. https://my.custom-cdn.com/)',
            }
        }
    })
        .then(function (r) {
        shell.mkdir('-p', "" + bundleName);
        shell.mkdir('-p', bundleName + "/source");
        ShellString(getBetelgeuseJson(bundleName, r.cdn)).to(bundleName + "/betelgeuse.json");
        ShellString(srcYaml).to(bundleName + "/source/index.yml");
        shell.exec([
            "cd " + bundleName,
            'git init',
            'git add .',
            'git commit -m "Betelgeuse Initial Commit!"'
        ].join(';'));
    })
        .then(function () {
        console.log('Done');
    })
        .catch(function (e) {
        console.log('\n');
        console.log(e.message);
    });
};
