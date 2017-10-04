import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as insert from 'gulp-insert';
import * as beautify from 'js-beautify';

const jsonToTsd = require('gulp-json-to-tsd');
const intercept = require('gulp-intercept');


// import { indent, fromMultiline, toMultiline } from '../util';
import { getSwiftType } from './typeAnalysis';
import {
  AnyJSON,
  InstanceProperty,
} from './swift';
import { fromMultiline, indent } from '../util';

const DATA_VARIABLE_NAME = 'jsonData';



export const transform = (json: AnyJSON, className: string): string => {

  const CUSTOM_DEFINITIONS = {};

  const instanceProperties: InstanceProperty[] = R.map((k) => {
    const type = getSwiftType(json[k], k, CUSTOM_DEFINITIONS);

    return {
      declaration: `public let ${k}: ${type.name}`,
      typeDefinition: type.definition,
      assignment: type.assignment(k),
    }
  }, R.keys(json));


  return fromMultiline([
    `public class ${className} {`,
    '',
    indent(4)([
      R.map((prop) => {
        if (!prop.typeDefinition) {
          return prop.declaration;
        }

        return [
          prop.declaration,
          prop.typeDefinition,
        ].join('\n');

      }, instanceProperties).join('\n'),
      '',
      `init(_ ${DATA_VARIABLE_NAME}: NSDictionary) {`,
      indent(4)([
        R.map((prop) => prop.assignment, instanceProperties).join('\n'),
      ]),
      `}`,
    ]),
    `}`,
  ]).join('\n');
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


type GenerateOptions = {
  namespace: string;
  src?: string;
}

export const generate = (json: string, o: GenerateOptions) => {
  return prefix(transform(validateAndGetJSON(json), o.namespace));
}
