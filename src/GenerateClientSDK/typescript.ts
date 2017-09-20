import { readFile } from '../util';
import * as Promise from 'bluebird';
import * as R from 'ramda';

import { Options } from './GenerateClientSDK';

const compileTpl = R.curry((matchers: { [toFind: string]: string }, content: string) => {
  return R.reduce((result, toFind) => {
    const replaceWith = matchers[toFind];
    const regex = new RegExp(toFind, 'g');

    return result.replace(regex, replaceWith);
  }, content, R.keys(matchers));
});

export const generate = (options: Options) => {
  const dirPath = __dirname + '/../../SDKTemplates/typescript';
  const compile = compileTpl({
    '__APP_NAME__': options.appName,
    '__CURRENT_VERSION_AT_BUILDTIME__': options.repoVersion,
    '__ENDPOINT_BASE_URL__': options.endpointBaseUrl,
  });

  return Promise.all([
    readFile(dirPath + '/typescript.d.ts.tpl').then(compile),
    readFile(dirPath + '/typescript.js.tpl').then(compile),
  ]);
}