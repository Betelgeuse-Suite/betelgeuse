import * as R from 'ramda';
import { getRandomString } from '../../util';
import { indent, fromMultiline } from '../util';
import { upperFirst } from 'lodash'

export enum TypeClass {
  primitive,
  array,
  object,
}

export type PrimitiveTypes = 'Int' | 'Double' | 'String' | 'Bool' | 'Any' | 'NSNull';
export type SwiftType = {
  name: PrimitiveTypes | string;
  class: TypeClass;
  definition: string;
  assignment: (k: string) => string;
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

export type InstanceProperty = {
  declaration: string;
  assignment: string;
  typeDefinition: string;
}

const DATA_VARIABLE_NAME = 'jsonData';
export const transform = (json: AnyJSON, className: string): string => {

  const instanceProperties: InstanceProperty[] = R.map((k) => {
    const type = getSwiftType(json[k], k);

    return {
      declaration: `public let ${k}: ${type.name}`,
      typeDefinition: type.definition,
      assignment: type.assignment(k),
    }
  }, R.keys(json));


  return fromMultiline([
    `class ${className} {`,
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

const getCommonType = (arrayOfValues: any[], key: string): SwiftType => {
  const typeNames = R.map((itemValue) => {
    const type = getSwiftType(itemValue, key);

    if (type.class === TypeClass.object) {
      return hash(R.keys(itemValue).join(''));
    }
    else if (type.class === TypeClass.array) {
      // console.log('yes its array');

      const nestedItemValues = <any[]>itemValue;

      return R.map((nestedItem) => getCommonType(nestedItem, key), nestedItemValues).join('-');

      // return hash(R.map((t) => {
      //   return getSwiftType(t, key).name
      // }, nestedItemValues).join(''));
    }

    return type.name;
  }, arrayOfValues);

  // console.log('type', typeNames);
  // console.log('')
  // console.log('')

  const uniqTypeNames = R.uniqBy((t) => t, typeNames);

  // console.log('uniq types', uniqTypeNames)
  // console.log('---');
  // console.log('')

  if (uniqTypeNames.length === 1) {
    let type = getSwiftType(arrayOfValues[0], key);

    let name = `[${[type.name]}]`;
    return {
      name,
      class: TypeClass.array,
      definition: type.definition,
      assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
    }
  }
  else {
    let name = `[Any]`;
    return {
      name,
      class: TypeClass.array,
      definition: '',
      assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
    };
  }
};


export const getSwiftType = (value: any, key: string): SwiftType => {
  const assignPrimitives = R.curry((typeName: string, k: string) => {
    return `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${typeName}`;
  });

  if (value == null || typeof value === 'undefined') {
    const name = 'NSNull';

    return {
      name,
      class: TypeClass.primitive,
      definition: '',
      assignment: assignPrimitives(name),
    };
  } else if (typeof value === 'number') {
    if (isFloatType(value)) {
      let name = 'Float'

      return {
        name,
        class: TypeClass.primitive,
        definition: '',
        assignment: assignPrimitives(name),
      }
    } else {
      let name = 'Int';
      return {
        name,
        class: TypeClass.primitive,
        definition: '',
        assignment: assignPrimitives(name),
      }
    }
  } else if (typeof value === 'string') {
    let name = 'String';

    return {
      name,
      definition: '',
      class: TypeClass.primitive,
      assignment: assignPrimitives(name),
    };
  } else if (typeof value === "boolean") {
    let name = 'Bool';

    return {
      name,
      definition: '',
      class: TypeClass.primitive,
      assignment: assignPrimitives(name),
    };
  }
  // If array
  else if (typeof value === 'object' && typeof value.length === 'number') {
    if (value.length === 0) {
      let name = '[NSNull]'

      return {
        name,
        class: TypeClass.array,
        definition: '',
        assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
      }
    }

    // const arrayOfValues = <any[]>value;



    // const firstTypeHash = hash(R.keys(arrayOfValues[0]));

    // const anyType = R.any((t) => {
    //   const tType = getSwiftType(t, key).type;
    //   console.log('tType', tType);
    //   return t.type !== firstType.type;
    // }, arrayOfValues.slice(1));

    // console.log(key, 'anyType?', anyType);

    // return {
    //   type: ,
    //   defi
    // }

    // return (areAllTypesIdentical(<any[]>arrayOfValues))
    //   ? {
    //     type: '[Any]',
    //     definition: '',
    //   }
    //   : {
    //     type: `[${firstType.type}]`,
    //     definition: firstType.definition,
    //   };

    return getCommonType(value, key);
  }
  else if (typeof value === 'object') {
    let name = upperFirst(key);
    return {
      name,
      class: TypeClass.object,
      definition: transform(value, name),
      assignment: (k: string) => `self.${k} = ${name}(${DATA_VARIABLE_NAME}["${k}"] as! NSDictionary)`,
    }
  }
  else {
    let name = 'Any';

    return {
      name,
      class: TypeClass.primitive,
      definition: '',
      assignment: assignPrimitives(name),
    };
  }
}
