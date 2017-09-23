import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as insert from 'gulp-insert';
import * as beautify from 'js-beautify';

const jsonToTsd = require('gulp-json-to-tsd');
const intercept = require('gulp-intercept');


import { indent, fromMultiline, toMultiline } from '../util';
import { getSwiftType } from './util';

const NAMESPACE_NAME = 'Beetlejuice';
const appendTemplate = `export = ${NAMESPACE_NAME};`;

type GenerateOptions = {
  namespace: string;
  src?: string;
}


type AnyJSON = {
  [k: string]: any;
  [k: number]: string;
}


const transform = (json: AnyJSON, className: string): string => {
  const DATA_VARIABLE_NAME = 'jsonData';

  type InstanceProperty = {
    declaration: string;
    assignment: string;
  }

  const instanceProperties: InstanceProperty[] = R.map((k) => {
    const type = getSwiftType(json[k]);

    return {
      declaration: `public let ${k}: ${type}`,
      assignment: `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${type}`,
    }
  }, R.keys(json));


  return fromMultiline([
    'import Foundation',
    '',
    `class ${className} {`,
    '',
    indent(4)([
      R.map((prop) => prop.declaration, instanceProperties).join('\n'),
      '',
      `init(${DATA_VARIABLE_NAME}: NSDictionary) {`,
      indent(4)([
        R.map((prop) => prop.assignment, instanceProperties).join('\n'),
      ]),
      `}`,
    ]),
    `}`,
  ]).join('\n');
}


const validateAndGetJSON = (string: string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    throw new Error(`Invalid JSON: \n ${string}`);
  }
}

export const generate = (json: string, o: GenerateOptions) => {
  return transform(validateAndGetJSON(json), o.namespace);
}
