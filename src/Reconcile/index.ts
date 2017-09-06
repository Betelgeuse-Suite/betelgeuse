import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as clc from 'cli-color';
import * as jsBeautify from 'js-beautify';
import { jsonToObj } from '../util';

export const reconcile = (prevJson: string, currentJson: string) => {
  return Promise
    .resolve(R.merge(jsonToObj(prevJson), jsonToObj(currentJson)))
    .then((merged) => JSON.stringify(merged))
    .then(jsBeautify)
    .catch((e: Error) => {
      console.error(clc.yellow(e.toString()));
    });
};