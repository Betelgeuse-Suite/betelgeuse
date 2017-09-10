import * as Promise from 'bluebird';

import {
  writeFile,
  now,
  makeDirRecursively,
  passThroughAwait,
} from './util';
import * as R from 'ramda';

export const prepend = (str: string) => {
  return `   
    Created at ${now()}
    ${str}
  `;
}

const getDirPath = (filePath: string) => {
  if (filePath.slice(0, 2) === './') {
    return filePath.slice(2, filePath.indexOf('/'));
  }
  else if (filePath.slice(0, 3) === '../') {
    return filePath.slice(3, filePath.indexOf('/'));
  }

  return filePath.slice(0, filePath.lastIndexOf('/'));
}

export const createFile = (outPath: string, fromStr: string) => {
  return Promise
    .resolve(makeDirRecursively(getDirPath(outPath)))
    .then(() => writeFile(outPath, fromStr))
    .catch((e) => {
      console.error('createFile Error', e);

      return Promise.reject(e);
    });
}
