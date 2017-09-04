import * as clc from 'cli-color';

import Exception from './exception';
import { buildNextVersion } from './IO';
import { writeFile } from './util';


// Guards
const argv = require('minimist')(process.argv.slice(2));

try {
  if (typeof argv.prev !== 'string') {
    throw new Exception('--prev argument not given!');
  }

  if (typeof argv.src !== 'string') {
    throw new Exception('--src argument not given!');
  }

  if (argv.hasOwnProperty('out') && typeof argv.out !== 'string') {
    throw new Exception('--out argument cannot be empty!');
  }

  buildNextVersion(argv.prev, argv.src)
    .then((next: string) => {
      if (typeof argv.out === 'string') {
        writeFile(argv.out, next);
      } else {
        process.stdout.write(`${next}\n`);
      }
    });

} catch (e) {
  console.log(clc.red(e.toString()));
}
