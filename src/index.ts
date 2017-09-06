// import * as clc from 'cli-color';

// import Exception from './exception';
// import { buildNextVersion } from './IO';
// import { writeFile } from './util';

import * as commander from 'commander';
const pkg = require('../package.json');
import { readJSONFile, objToJson } from './util';
import * as beautify from 'js-beautify';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes } from './GenerateTypes';
import { reconcile } from './Reconcile';

const command_generateJson = (srcDir: string) => {
  Promise
    .resolve(generateJSONFromYamlFiles(srcDir))
    .then((v) => {
      console.log('JSON', v);
    });
}

const command_generateTypes = (jsonFilePath: string, options: { out?: string } = {}) => {
  Promise
    .resolve(generateTypes(jsonFilePath))
    .then((json) => {
      console.log('generate json', json[0]);
    });
}

const command_reconcile = (srcDir: string, options: { prev?: string } = {}) => {
  Promise
    .all([
      (typeof options.prev === 'string')
        ? readJSONFile(options.prev)
        : '{}', // empty json
      generateJSONFromYamlFiles(srcDir),
    ])
    .then(([prevJson, nextJson]) => reconcile(prevJson, nextJson))
    .then((r) => {
      console.log('reconciled', r);
    });
}

commander
  .version(pkg.version)

commander
  .command('generate-json <srcDir>')
  .action(command_generateJson);

commander
  .command('reconcile <srcDir>')
  .option('--prev, [prev]', 'Previous version of the file to merge')
  .action(command_reconcile);

commander
  .command('generate-types <jsonFilePath>')
  .option('--out [out]', 'Output directory path')
  .action(command_generateTypes);


commander.parse(process.argv);
