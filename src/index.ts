// import { js_beautify } from 'js-beautify';
import * as Promise from 'bluebird';
import * as clc from 'cli-color';
import * as semver from 'semver';

import concat from './concat';
import { 
  readFile,
  // writeFile,
  passThrough,
} from './util';
import { 
  applyVersion,
  // FileContent,
} from './version';
import Exception from './exception';

const now = () => new Date().getTime();
const log = (...args: string[]) => {
  if (typeof argv.out === 'string') {
    console.log.apply(console, [`[${now()}]`].concat(args));
  }
};

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
      next: concat(src),
      prev: getPrev(prevPath)
    })
    .then(({ prev, next }) => applyVersion(prev, next))
    // .then(passThrough((next) => {
    //   log('Next version:', next.__version);
    // }));

const build = (prev: string, src: string, out: string) => {
  log(`Starting point:`, prev);

  console.log('prev', prev);
  console.log('src', src);
  console.log('out', out);

  getNext(prev, src)
      .then(JSON.stringify.bind(JSON))
      // .then(js_beautify)
      .then((x) => {
        console.log('build', x);
      })
      // .then((nextContent: any) => {
      //   if (typeof out === 'string') {
      //     return writeFile(out, nextContent);
      //   } else {
      //     process.stdout.write(`${nextContent}\n`);
      //     return null;
      //   }
      // })
      .catch((e: Error) => {
        console.error(clc.red(e.toString()));
      });
};


// Guards
const argv = require('minimist')(process.argv.slice(2));

try {
  if (typeof argv.prev !== 'string') {
    throw new Exception('--prev argument not given!');
  }

  if (argv.hasOwnProperty('out') && typeof argv.out !== 'string') {
    throw new Exception('--out argument cannot be empty!');
  }

  build(
    argv.prev,
    argv.src || './',
    argv.out,
  );

} catch (e) {
  console.log(clc.red(e.toString()));
}
