import * as R from 'ramda';
import { getRandomString } from '../../util';
import { indent, fromMultiline } from '../util';


export type PrimitiveTypes = 'Int' | 'String' | 'Bool' | 'Any' | 'Void';
export type GetSwiftType = {
  type: PrimitiveTypes | string;
  definition: string;
}

export type AnyJSON = {
  [k: string]: any;
  [k: number]: string;
}

export const transform = (json: AnyJSON, className: string): string => {
  const DATA_VARIABLE_NAME = 'jsonData';

  type InstanceProperty = {
    declaration: string;
    assignment: string;
    typeDefinition?: string;
  }

  const instanceProperties: InstanceProperty[] = R.map((k) => {
    const type = getSwiftType(json[k]);

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


export const getSwiftType = (value: any): GetSwiftType => {
  if (value == null) {
    return {
      type: 'Void',
      definition: '',
    };
  } else if (typeof value === 'number') {
    return {
      type: 'Int',
      definition: '',
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
  else if (typeof value === 'object' && typeof value.length === 'number') {
    console.log('is array called');
    // do nothing for now
  }
  else if (typeof value === 'object') {
    const className = `CustomType_${getRandomString(5)}`
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

// export const toTypeDeclaration = R.curry((
//   type: string,
//   key: string,
// ) => {
//   return `public let ${key}: ${type};`
// });

// export const toValueAssignment = R.curry((
//   type: string,
//   value: 
// ))


