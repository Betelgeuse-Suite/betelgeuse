import * as shell from 'shelljs';
const gitTags = require('git-tags');
import * as Promise from 'bluebird';
import { readFile, writeFile, passThrough } from '../util';
import * as R from 'ramda';
import * as beautify from 'js-beautify';

type Versions = { [v: string]: string };

const getTags = () => new Promise((resolve, reject) => {
  gitTags.get((error: string | null, tags: string[]) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(tags);
  });
})
  .then((tags) => <String[]>tags)
  .then(R.map(trimPrefix));

const trimPrefix = (v: string) => v.replace('v', '');

const listToObject = (list: string[]) => {
  return R.reduce((obj: { [index: string]: string }, item) => {
    obj[item] = '';
    return obj;
  }, {}, list)
}

const getFileContentJSON = (vv: Versions) => {
  return R.pipe(
    JSON.stringify,
    beautify,
  )(vv);
}

const getFileContentJS = (vv: Versions) => {
  return R.pipe(
    getFileContentJSON,
    (json: string) => `__beetlejuice__getVersions(${json});`,
  )(vv);
}


export const updateVesionRegistry = (repoPath: string) => {
  // validate is beetlejuice client repo

  const versionFiles = {
    js: `${repoPath}/versions.js`,
    json: `${repoPath}/versions.json`,
  }

  return Promise
    .resolve(shell.exec('git pull --tags origin')) // fetch all the tags first
    .then(() => getTags())
    .then(listToObject)
    .then((versions) => [
      getFileContentJS(versions),
      getFileContentJSON(versions),
    ])
    .then(([js, json]) => Promise.all([
      writeFile(versionFiles.js, js),
      writeFile(versionFiles.json, json),
    ]));
}
