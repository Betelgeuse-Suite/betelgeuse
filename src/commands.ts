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
  getUncommitedFiles,
  getNextVersionNumber,
} from './util';
import { createFile } from './CreateFile';

import { generateJSONFromYamlFiles } from './GenerateJSON';
import { generateTypes } from './GenerateTypes';
import { generateClientSDKs } from './GenerateClientSDK';
import { getReleaseType } from './Diff';
import { updateVesionRegistry } from './VersionsRegistry';
import {
  Platform,
  BetelgeuseReleaseType,
} from './Betelgeuse';
import {
  getBundleInformation,
} from './Bundle';


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
        console.log('Successfully generated JSON files');
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
        console.log(`Successfully generated ${Platform[platform]} file`);
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
        console.log('Successfully generated Client SDKs');
      }
    }));
}

export const command_compile_sdk = (bundlePath: string) => {
  // validate is betelgeuse repo
  const bundle = getBundleInformation(bundlePath);

  return Promise
    .resolve(command_generateClientSDK(bundle.appName, {
      out: bundle.paths.bin,
      repoVersion: bundle.version,
      endpointBaseUrl: bundle.cdn,
    }))
    .catch((e: Exception) => console.error(e.message));
}

export const command_compile = (bundlePath: string) => {

  // validate bundle: ./source, ./compiled dir and package.json or smtg like that
  const bundle = getBundleInformation(bundlePath);
  
  console.log('Compiling', bundle.appName, '...', '\n');

  if (!!getUncommitedFiles(bundle.paths.bin)) {
    console.log('');
    console.log('There are unsaved changes in .bin (Probably from a previous compilation)! Save the changes and retry.');
    return;
  }

  const clean = (path: string) => {
    shell.rm('-rf', path);
    shell.mkdir(path);
  }

  const updateBinDir = () => {
    shell.rm('-rf', bundle.paths.bin);
    shell.mv(bundle.paths.tmp, bundle.paths.bin);
  }

  const initPayload = {
    releaseType: 'none',
    version: bundle.version,
  };

  return Promise
    // start with an initial payload
    .resolve(initPayload)
    .then(passThrough(() => clean(bundle.paths.tmp)))
    .then(passThrough(() => command_generateJson(`${bundle.paths.source}`, { out: `${bundle.paths.tmp}` }))) // => json
    .then((payload) => {
      return getReleaseTypeFromFiles(`${bundle.paths.tmp}/Data.json`, `${bundle.paths.bin}/Data.json`)
        .then((nextReleaseType) => ({
          releaseType: nextReleaseType,
          version: getNextVersionNumber(payload.version, nextReleaseType),
        }));
    })
    .then(passThroughAwait(() => Promise.all([
      // TODO filter by platform
      command_generateTypes(`${bundle.paths.tmp}/Data.json`, Platform.typescript, { out: `${bundle.paths.tmp}/Data.d.ts` }), // => tsd
      command_generateTypes(`${bundle.paths.tmp}/Data.json`, Platform.swift, { out: `${bundle.paths.tmp}/Model.swift` }), // swift
    ])))
    .then(passThroughAwait((payload) => command_generateClientSDK(bundle.appName, {
      out: bundle.paths.tmp,
      repoVersion: payload.version,
      endpointBaseUrl: bundle.cdn,
    })))
    .then(passThrough(updateBinDir))
    .then(() => {
      console.log('');
      console.log('Done.');
    })
    .catch((e: Exception) => console.error(e.message));
}


// WIP the Save function is a combinatino of ApplyVersion and updateVersionsRegistry
// Hmm...not quite sure how to get the release type without passing it in
export const command_save = (bundlePath: string) => {
  // validate bundle: ./source, ./compiled dir and package.json or smtg like that
  const bundle = getBundleInformation(bundlePath);
  
  console.log('Saving', bundle.appName, '...', '\n');

  return Promise
    .resolve()
    .then(() => {

    });
}

// .then((releaseType) => applyVersion(releaseType, AppName, repoPath)) // => apply next version
    // .then(() => updateVersionRegistryAndCommit(repoPath)) // update the version registry

    // TODO: Take out most of the git commit commands, and moing files aroun and only stick with the tagging and maybe one last commit
const applyVersion = (releaseType: BetelgeuseReleaseType, AppName: string, repoPath: string) => {
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
      if (getUncommitedFiles(repoPath)) {
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

// TODO: don't update in the VersionsRegistry
const updateVersionRegistryAndCommit = (repoPath: string) => {
  return Promise
    .resolve(updateVesionRegistry(repoPath))
    .then(() => {
      shell.exec('git add versions.json versions.js')
      shell.exec('git commit -m "Version registry updated"')
    });
}


export const command_deploy = (bundlePath: string) => {
  // validate that path is a bundle
  const bundle = getBundleInformation(bundlePath);

  // Deploy the copmiled changes (by pushing to its remote origin)
  return shell.exec('git push origin master; git push --tags');
}