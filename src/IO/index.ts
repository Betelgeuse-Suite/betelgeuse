import * as semver from 'semver';
import * as Promise from 'bluebird';
import * as clc from 'cli-color';
import * as jsBeautify from 'js-beautify';

import { applyVersion } from '../Version';
import {
  readFile,
  writeFile,
  passThrough,
  passThroughAwait,
 } from '../util';

import { concatFilesAtPath } from '../concat';


// const now = () => new Date().getTime();
// const log = (...args: string[]) => {
//   if (typeof argv.out === 'string') {
//     console.log.apply(console, [`[${now()}]`].concat(args));
//   }
// };

const log = console.log;

const getPrev = (path: string) => readFile(path)
    .then((file) => {
      if (typeof file === 'string') {
        return JSON.parse(file);
      }

      throw 'Prev file is not a JSON!';
    })
    .then((content) => {
      if (!content.hasOwnProperty('__version')) {
        throw 'Invalid Prev File: __version property is not defined';
      } else if (!semver.valid(content.__version)) {
        throw `Invalid Prev File: __version: ${content.__version} is not valid`;
      }

      return content;
    })
    .then(passThrough((prev) => {
      log('Previous version:', prev.__version);
    }));

const getNext = (prevPath: string, src: string) => Promise
    .props({
      next: concatFilesAtPath(src),
      prev: getPrev(prevPath)
    })
    .then(({ prev, next }) => applyVersion(prev, next))
    .then((next) => {
      log('Next version:', next.__version);

      return next;
    });

export const build = (prevPath: string, srcPath: string, outPath?: string) => {
  // log(`Starting point:`, prev);
  console.log('cwd', process.cwd());

  console.log('prev', prevPath);
  console.log('src', srcPath);
  console.log('out', outPath);


  getNext(prevPath, srcPath)
      .then(JSON.stringify.bind(JSON))
      .then(jsBeautify)
      .then(passThroughAwait((nextContent: string) => {
        if (typeof outPath === 'string') {
          return writeFile(outPath, nextContent);
        } else {
          process.stdout.write(`${nextContent}\n`);
          return Promise.resolve();
        }
      }))
      .catch((e: Error) => {
        console.log('is this the errorr??');
        console.error(clc.yellow(e.toString()));
      });
};