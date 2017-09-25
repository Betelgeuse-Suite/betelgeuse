import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as insert from 'gulp-insert';
import * as beautify from 'js-beautify';

const jsonToTsd = require('gulp-json-to-tsd');
const intercept = require('gulp-intercept');


// import { indent, fromMultiline, toMultiline } from '../util';
import { transform } from './util';

const NAMESPACE_NAME = 'Beetlejuice';
const appendTemplate = `export = ${NAMESPACE_NAME};`;

type GenerateOptions = {
  namespace: string;
  src?: string;
}

const prefix = (content: string) => {
  return [
    'import Foundation',
    '',
    `${content}`
  ].join('\n');
}

const validateAndGetJSON = (string: string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    throw new Error(`Invalid JSON: \n ${string}`);
  }
}

export const generate = (json: string, o: GenerateOptions) => {
  return prefix(transform(validateAndGetJSON(json), o.namespace));
}
