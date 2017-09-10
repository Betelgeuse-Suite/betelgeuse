import * as commander from 'commander';
import * as shell from 'shelljs';
import * as Promise from 'bluebird';

import { passThrough } from './util';
import {
  Exception,
  NoChangesException,
  UncommitedChanges,
} from './Exception';

const pkg = require('../package.json');
import {
  objToJson,
  readFile,
  jsonToObj,
  passThroughAwait,
  writeFile,
} from './util';
import * as beautify from 'js-beautify';
import { createFile } from './CreateFile';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes } from './GenerateTypes';
import { generateClientSDKs } from './GenerateClientSDK';
import { getReleaseType } from './Version';

const command_generateJson = (srcDir: string, options: { out?: string } = {}) => {
  return Promise
    .resolve(generateJSONFromYamlFiles(srcDir))
    .then((json) => {
      if (typeof options.out !== 'string') {
        console.log(json);
        return Promise.resolve(json);
      }

      return createFile(options.out, json);
    })
    .then(passThrough(() => {
      console.log('Successfully generated JSON files from', srcDir, 'at', options.out);
    }));
}

const command_generateTypes = (jsonFilePath: string, options: { out?: string } = {}) => {
  return Promise
    .resolve(generateTypes(jsonFilePath))
    .then(passThroughAwait(([tsd]) => {
      if (typeof options.out !== 'string') {
        console.log(tsd);
        return;
      }

      return writeFile(options.out, tsd);
    }))
    .then(passThrough(() => {
      console.log('Successfully generated Typescript .tsd from', jsonFilePath, 'at', options.out);
    }));
}

commander
  .version(pkg.version)

// Step 1 - Generate the json from yaml
commander
  .command('generate-json <srcDir>')
  .option('--out [out]', 'Output file path')
  .action(command_generateJson);

// Step 2 - Get the Release Type by comparing the previous file with the generated one
const getReleaseTypeFromFiles = (nextJsonPath: string, prevJsonPath: string) => {
  return Promise.all([
    readFile(nextJsonPath).then(jsonToObj),
    readFile(prevJsonPath).then(jsonToObj),
  ])
    .then(([prev, next]) => getReleaseType(prev, next));
}

const command_getReleaseType = (nextJsonPath: string, prevJsonPath: string) => {
  Promise
    .resolve(getReleaseTypeFromFiles(nextJsonPath, prevJsonPath))
    .then((release) => {
      console.log('Version type:', release);
    });
}

commander
  .command('get-release-type <nextJsonPath> <prevJsonPath>')
  .action(command_getReleaseType);

// Step 3 - Generate the Type file
commander
  .command('generate-types <jsonFilePath>')
  .option('--out [out]', 'Output directory path')
  .action(command_generateTypes);

// Extra Step - Generate Client SDK template

const command_generateClientSDK = (appName: string, options: { out?: string } = {}) => {
  return Promise
    .resolve(generateClientSDKs(appName))
    .then(([typescript]) => {
      const [dts, js] = typescript;

      if (typeof options.out !== 'string') {
        console.log(dts);
        console.log('');
        console.log(js);

        return;
      }

      return Promise.all([
        writeFile(`${options.out}/beetlejuice.d.ts`, dts),
        writeFile(`${options.out}/beetlejuice.js`, js),
      ])
        // return a single value, otherwise the compiler complains.
        .then(() => undefined);
    })
    .then(passThrough(() => {
      console.log('Successfully generated SDKs at', options.out);
    }));

}

const untrackedFiles = () => {
  return !!shell.exec('git diff --name-only').stdout;
}

const applyVersion = (AppName: string, repoPath: string) => {
  const tmp = `${repoPath}/tmp`;
  const compiled = `${repoPath}/.bin`;

  return Promise
    .resolve(getReleaseTypeFromFiles(`${tmp}/${AppName}.json`, `${compiled}/${AppName}.json`))
    .then((releaseType) => {
      if (releaseType === 'none') {
        return Promise.reject(new NoChangesException())
      }

      return releaseType;
    })
    .then(passThrough((releaseType) => {
      if (untrackedFiles()) {
        return Promise.reject(new UncommitedChanges())
      }

      // Move the files over
      shell.rm('-rf', compiled);
      shell.mkdir(compiled);

      shell.cp('-R', `${tmp}/*`, compiled)
      shell.rm('-rf', tmp);
    }))
    .then(passThrough(() => {
      // Commit the compile step
      shell.exec(`git add ${compiled}`);
      shell.exec(`git commit -m 'Beetlejuice Commit: Source Compiled.'`);
    }))
    .then((releaseType) => {
      // Apply the version, by using `npm version` which creates a commit and a relese tag
      return shell.exec(`npm version ${releaseType}`);
    })
    .then(() => {
      // Deploy the copmiled changes (by pushing to git repo to its remote origin)
      return shell.exec('git push origin master; git push --tags');
    });
}

commander
  .command('generate-client-sdks <AppName>')
  .option('--out', 'Output directory path')
  .action(command_generateClientSDK);

// The compile command takes care of:
//  Steps 1, 2, 3 and 4 - - Apply the next version to both generated files
const command_compile = (repoPath: string) => {
  // validate is beetlejuice repo: ./source, ./compiled dir and package.json or smtg like that
  const AppName = 'MyApp';

  const tmp = `${repoPath}/tmp`;
  const compiled = `${repoPath}/.bin`;

  console.log('HELLO');

  return Promise
    .resolve()
    .then(() => {
      // Clean Step
      shell.rm('-rf', tmp);
      shell.mkdir(tmp);
    })
    .then(() => command_generateJson(`${repoPath}/source`, { out: `${tmp}/${AppName}.json` })) // => json
    .then(() => command_generateTypes(`${tmp}/${AppName}.json`, { out: `${tmp}/${AppName}.d.ts` })) // => tsd
    .then(() => command_generateClientSDK(AppName, { out: `${tmp}` })) // => client sdks 
    .then(() => applyVersion(AppName, repoPath)) // => apply next version
    .catch((e: Exception) => console.error(e.message));
}

commander
  .command('compile <repositoryPath>')
  .action(command_compile);


// Step 5 - Push new files to the CDN
// No need for it yet, as we can use the git repo for testing


commander.parse(process.argv);
