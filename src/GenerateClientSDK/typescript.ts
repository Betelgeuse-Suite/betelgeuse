import { readFile } from '../util';
import * as Promise from 'bluebird';
import * as R from 'ramda';

const compileTpl = R.curry((matchers: { [toFind: string]: string }, content: string) => {
  return R.reduce((result, toFind) => {
    const replaceWith = matchers[toFind];
    const regex = new RegExp(toFind, 'g');

    return result.replace(regex, replaceWith);
  }, content, R.keys(matchers));
});

export const generate = (appName: string) => {
  const dirPath = __dirname + '/../../SDKTemplates/typescript';
  const compile = compileTpl({
    '__SAMPLE__': appName,
    '__CURRENT_VERSION__': '5.6.3',
    '__ENDPOINT_BASE_URL__': 'asdad.com'
  });

  return Promise.all([
    readFile(dirPath + '/typescript.d.ts.tpl').then(compile),
    readFile(dirPath + '/typescript.js.tpl').then(compile),
  ]);
}