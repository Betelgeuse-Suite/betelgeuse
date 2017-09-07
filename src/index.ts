import * as commander from 'commander';
const pkg = require('../package.json');
import { objToJson, readFile, jsonToObj } from './util';
import * as beautify from 'js-beautify';
import { createFile } from './CreateFile';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes } from './GenerateTypes';
import { getReleaseType } from './Version';

const command_generateJson = (srcDir: string, options: { out?: string } = {}) => {
  Promise
    .resolve(generateJSONFromYamlFiles(srcDir))
    .then((json) => {
      if (typeof options.out !== 'string') {
        console.log(json);
        return;
      }

      createFile(options.out, json);
    });
}

const command_generateTypes = (jsonFilePath: string, options: { out?: string } = {}) => {
  Promise
    .resolve(generateTypes(jsonFilePath))
    .then((json) => {
      console.log('generate json', json[0]);
    });
}

commander
  .version(pkg.version)

// Step 1 - Generate the json from yaml
commander
  .command('generate-json <srcDir>')
  .option('--out [out]', 'Output file path')
  .action(command_generateJson);

// Step 2 - Get the Release Type by comparing the previous file with the generated one
commander
  .command('get-release-type <nextJsonPath> <prevJsonPath>')
  .action((next: string, prev: string) => {
    Promise.all([
      readFile(prev).then(jsonToObj),
      readFile(next).then(jsonToObj),
    ])
      .then(([prev, next]) => getReleaseType(prev, next))
      .then((release) => {
        console.log('Version type:', release);
      })
  });

// Step 3 - Generate the Type file
commander
  .command('generate-types <jsonFilePath>')
  .option('--out [out]', 'Output directory path')
  .action(command_generateTypes);

// Step 4 - Apply the next version to both generated files

// Step 5 - Push new files to the CDN

commander.parse(process.argv);
