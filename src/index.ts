import * as commander from 'commander';
const pkg = require('../package.json');
import { objToJson, readFile, jsonToObj } from './util';
import * as beautify from 'js-beautify';
import { createFile } from './CreateFile';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes } from './GenerateTypes';
// import { reconcile } from './Reconcile';
import { getReleaseType } from './Version';

// import { A } from '../a.d';

// const getData = () => {
//   const json = require('../tmp/a.json');
//   return <A>json;
// }

// console.log('getData', getData());


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

// const command_reconcile = (srcDir: string, options: { prev?: string } = {}) => {
//   Promise
//     .all([
//       (typeof options.prev === 'string')
//         ? readFile(options.prev)
//         : '{}', // empty json
//       generateJSONFromYamlFiles(srcDir),
//     ])
//     .then(([prevJson, nextJson]) => reconcile(prevJson, nextJson))
//     .then((r) => {
//       console.log('reconciled', r);
//     });
// }

commander
  .version(pkg.version)

// commander
//   .command('reconcile <srcDir>')
//   .option('--prev, [prev]', 'Previous version of the file to merge')
//   .action(command_reconcile);


// Step 1 - Generate the json
commander
  .command('generate-json <srcDir>')
  .option('--out [out]', 'Output file path')
  .action(command_generateJson);

// Step 2 - Get the Release Type 
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


commander.parse(process.argv);
