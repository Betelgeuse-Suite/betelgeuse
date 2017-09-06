import { writeFile, now } from './util';
import * as R from 'ramda';

export const prepend = (str: string) => {
  return `   
    Created at ${now()}
    ${str}
  `;
}

export const makeFile = (outPath: string, fromStr: string) => {
  return Promise
    .resolve(fromStr)
    .then()
    .then(R.partial(writeFile, outPath));
}
