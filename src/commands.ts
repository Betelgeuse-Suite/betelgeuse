import * as shell from 'shelljs';
import * as Promise from 'bluebird';
import * as Semver from 'semver';
import * as R from 'ramda';

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
  jsonToJSONP,
  getUntrackedFiles,
  getNextVersionNumber,
} from './util';
import { createFile } from './CreateFile';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes, Platform } from './GenerateTypes';
import { generateClientSDKs } from './GenerateClientSDK';
import { getReleaseType } from './Diff';
import { updateVesionRegistry } from './VersionsRegistry';

// This should come from somewhere else :) betelgeuse.json file
const APP_NAME = 'MyApp';


export const command_generateJson = (srcDir: string, options: { out?: string } = {}) => {
  return Promise
    .resolve(generateJSONFromYamlFiles(srcDir))
    .then((json: any) => { // don't why is complaining if I leave it as string
      if (typeof options.out !== 'string') {
        console.log(json);
        return Promise.resolve(json);
      }

      return Promise.all([
        createFile(`${options.out}/Data.json`, json),
        createFile(`${options.out}/Data.js`, jsonToJSONP(json)),
      ]);
    })
    .then(passThrough(() => {
      if (options.out) {
        console.log('Successfully generated JSON files from', srcDir, 'at', options.out);
      }
    }));
}

export const command_generateTypes = (
  jsonFilePath: string,
  platform: Platform,
  options: { out?: string } = {},
) => {
  return Promise
    .resolve(generateTypes(jsonFilePath, platform))
    .then(passThroughAwait((generated) => {
      if (typeof options.out !== 'string') {
        console.log(generated);
        return;
      }

      return writeFile(options.out, generated);
    }))
    .then(passThrough(() => {
      if (options.out) {
        console.log(`Successfully generated ${Platform[platform]} file based on`, jsonFilePath, 'at', options.out);
      }
    }));
}

const getReleaseTypeFromFiles = (nextJsonPath: string, prevJsonPath: string) => {
  return Promise.all([
    readFile(nextJsonPath).then(jsonToObj),
    readFile(prevJsonPath).then(jsonToObj),
  ])
    .then(([prev, next]) => getReleaseType(prev, next));
}

export const command_getReleaseType = (nextJsonPath: string, prevJsonPath: string) => {
  Promise
    .resolve(getReleaseTypeFromFiles(nextJsonPath, prevJsonPath))
    .then((release) => {
      console.log('Version type:', release);
    });
}

export const command_generateClientSDK = (
  appName: string,
  options: {
    endpointBaseUrl: string,
    repoVersion: string,
    out?: string,
  }) => {
  return Promise
    .resolve(generateClientSDKs({
      appName,
      endpointBaseUrl: options.endpointBaseUrl,
      repoVersion: options.repoVersion,
    }))
    .then(([typescript]) => {
      const { tsd, js } = typescript;

      if (typeof options.out !== 'string') {
        console.log(tsd);
        console.log('');
        console.log(js);

        return;
      }

      return Promise.all([
        writeFile(`${options.out}/betelgeuse.d.ts`, tsd),
        writeFile(`${options.out}/betelgeuse.js`, js),
      ])
        // return a single value, otherwise the compiler complains.
        .then(() => undefined);
    })
    .then(passThrough(() => {
      if (options.out) {
        console.log('Successfully generated SDKs at', options.out);
      }
    }));
}

const applyVersion = (releaseType: Semver.ReleaseType | 'none', AppName: string, repoPath: string) => {
  const tmp = `${repoPath}/tmp`;
  const compiled = `${repoPath}/.bin`;

  return Promise
    .resolve(releaseType)
    .then((releaseType) => {
      if (releaseType === 'none') {
        return Promise.reject(new NoChangesException())
      }

      return releaseType;
    })
    .then(passThrough((releaseType) => {
      if (getUntrackedFiles(repoPath)) {
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
      shell.exec(`git commit -m 'Betelgeuse Commit: Source Compiled.'`);
    }))
    .then((releaseType) => {
      // Apply the version, by using `npm version` which creates a commit and a relese tag
      return shell.exec(`npm version ${releaseType}`);
    });
}

const updateVersionRegistryAndCommit = (repoPath: string) => {
  return Promise
    .resolve(updateVesionRegistry(repoPath))
    .then(() => {
      shell.exec('git add versions.json versions.js')
      shell.exec('git commit -m "Version registry updated"')
    });
}

// The compile command takes care of:
//  Steps 1, 2, 3 and 4 - - Apply the next version to both generated files
export const command_compile = (repoPath: string) => {
  // validate is betelgeuse repo: ./source, ./compiled dir and package.json or smtg like that
  const AppName = APP_NAME;
  const compiled = `${process.cwd()}/${repoPath}/.bin`;
  const tmp = `${process.cwd()}/${repoPath}/tmp`;
  const repoPackage = require(`${process.cwd()}/${repoPath}/package.json`);

  // TODO: need to get the next semver to pass it to generateClientSDKs

  return Promise
    .resolve()
    .then(() => {
      // Clean Step
      shell.rm('-rf', tmp);
      shell.mkdir(tmp);
    })
    .then(() => command_generateJson(`${repoPath}/source`, { out: `${tmp}` })) // => json
    .then(() => Promise.all([
      command_generateTypes(`${tmp}/Data.json`, Platform.typescript, { out: `${tmp}/Data.d.ts` }), // => tsd
      command_generateTypes(`${tmp}/Data.json`, Platform.swift, { out: `${tmp}/Model.swift` }), // swift
    ]))
    .then(() => getReleaseTypeFromFiles(`${tmp}/Data.json`, `${compiled}/Data.json`))
    .then(passThroughAwait((releaseType) => command_generateClientSDK(AppName, { // => client sdks
      out: tmp,
      repoVersion: getNextVersionNumber(repoPackage.version, releaseType),
      endpointBaseUrl: repoPackage.cdn,
    })))
    .then((releaseType) => applyVersion(releaseType, AppName, repoPath)) // => apply next version
    .then(() => updateVersionRegistryAndCommit(repoPath)) // update the version registry
    .catch((e: Exception) => console.error(e.message));
}


export const command_compile_sdk = (repoPath: string) => {
  // validate is betelgeuse repo

  const AppName = APP_NAME;
  const compiled = `${process.cwd()}/${repoPath}/.bin`;
  const repoPackage = require(`${process.cwd()}/${repoPath}/package.json`);

  return Promise
    .resolve(command_generateClientSDK(AppName, {
      out: compiled,
      repoVersion: repoPackage.version,
      endpointBaseUrl: repoPackage.cdn,
    }))
    .catch((e: Exception) => console.error(e.message));
}

export const command_deploy = () => {
  // Deploy the copmiled changes (by pushing to its remote origin)
  return shell.exec('git push origin master; git push --tags');
}