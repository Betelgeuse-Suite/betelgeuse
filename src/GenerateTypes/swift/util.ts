import * as R from 'ramda';
import { getRandomString } from '../../util';
import { indent, fromMultiline } from '../util';
import { upperFirst } from 'lodash'


export type PrimitiveTypes = 'Int' | 'Double' | 'String' | 'Bool' | 'Any' | 'NSNull';
export type GetSwiftType = {
  type: PrimitiveTypes | string;
  definition: string;
}

export type AnyJSON = {
  [k: string]: any;
  [k: number]: string;
}


// copied from https://github.com/darkskyapp/string-hash/blob/master/index.js
const hash = (str: string) => {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
};

const isFloatType = (n: any) => {
  return !!(n && typeof n === 'number' && n % 1 !== 0);
}


export const transform = (json: AnyJSON, className: string): string => {
  const DATA_VARIABLE_NAME = 'jsonData';

  type InstanceProperty = {
    declaration: string;
    assignment: string;
    typeDefinition?: string;
  }

  const instanceProperties: InstanceProperty[] = R.map((k) => {
    const type = getSwiftType(json[k], k);

    return {
      declaration: `public let ${k}: ${type.type}`,
      typeDefinition: type.definition,
      assignment: !!type.definition
        ? `self.${k} = ${type.type}(${DATA_VARIABLE_NAME}["${k}"] as! NSDictionary)`
        : `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${type.type}`,
    }
  }, R.keys(json));


  return fromMultiline([
    `class ${className} {`,
    '',
    indent(4)([
      R.map((prop) => {
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


export const getSwiftType = (value: any, key: string): GetSwiftType => {
  if (value == null || typeof value === 'undefined') {
    return {
      type: 'NSNull',
      definition: '',
    };
  } else if (typeof value === 'number') {
    if (isFloatType(value)) {
      return {
        type: 'Float',
        definition: '',
      }
    } else {
      return {
        type: 'Int',
        definition: '',
      }
    }
  } else if (typeof value === 'string') {
    return {
      type: 'String',
      definition: '',
    };
  } else if (typeof value === "boolean") {
    return {
      type: 'Bool',
      definition: '',
    };
  }
  // If array
  else if (typeof value === 'object' && typeof value.length === 'number') {
    if (value.length === 0) {
      return {
        type: '[NSNull]',
        definition: '',
      }
    }

    const arrayOfValues = <any[]>value;

    const firstType = getSwiftType(arrayOfValues[0], key);

    const anyType = R.any((t) => {
      return getSwiftType(t, key).type !== firstType.type;
    }, arrayOfValues.slice(1));

    return (anyType)
      ? {
        type: '[Any]',
        definition: '',
      }
      : {
        type: `[${firstType.type}]`,
        definition: firstType.definition,
      };
  }
  else if (typeof value === 'object') {
    const className = upperFirst(key);
    return {
      type: className,
      definition: transform(value, className),
    }
  }

  return {
    type: 'Any',
    definition: '',
  };
}
