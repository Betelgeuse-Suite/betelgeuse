import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as clc from 'cli-color';
import * as jsBeautify from 'js-beautify';

import { readFile } from '../util';
import { concatFilesAtPath } from './concat';

const getPrev = (path: string) => readFile(path)
    .then((file) => {
      if (typeof file === 'string') {
        return JSON.parse(file);
      }

      throw 'Prev file is not a JSON!';
    });

const getNext = (prevPath: string, src: string) => Promise
    .props({
      next: concatFilesAtPath(src),
      prev: getPrev(prevPath)
    })
    .then(({prev, next}) => R.merge(prev, next));

export const buildNextVersion = (prevPath: string, srcPath: string) => {
  return getNext(prevPath, srcPath)
      .then(JSON.stringify.bind(JSON))
      .then(jsBeautify)
      .catch((e: Error) => {
        console.error(clc.yellow(e.toString()));
      });
};