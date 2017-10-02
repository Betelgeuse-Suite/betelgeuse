import * as R from 'ramda';
import { upperFirst, sortBy, isArray } from 'lodash';

import { getRandomString } from '../../util';
import { indent, fromMultiline } from '../util';
import {
  isFloatType,
  hash,
} from './util';

import {
  SwiftType,
  TypeClass,
  AnyJSON,
  InstanceProperty
} from './swift';

// not good
import { transform } from './index';

// TODO: move from here
const DATA_VARIABLE_NAME = 'jsonData';

type Definitions = {
  [hash: string]: {
    definition: string;
    name: string;
  }
};

/**
 * Tests each key for a known type, including both Primitives and Recursive Types
 *  or falls back to Any
 */
export const getSwiftType = (value: any, key: string, definitions: Definitions): SwiftType => {
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
      hash: name,
    };
  } else if (typeof value === 'number') {
    if (isFloatType(value)) {
      let name = 'Float'

      return {
        name,
        class: TypeClass.primitive,
        definition: '',
        assignment: assignPrimitives(name),
        hash: name,
      }
    } else {
      let name = 'Int';
      return {
        name,
        class: TypeClass.primitive,
        definition: '',
        assignment: assignPrimitives(name),
        hash: name,
      }
    }
  } else if (typeof value === 'string') {
    let name = 'String';

    return {
      name,
      definition: '',
      class: TypeClass.primitive,
      assignment: assignPrimitives(name),
      hash: name,
    };
  } else if (typeof value === "boolean") {
    let name = 'Bool';

    return {
      name,
      definition: '',
      class: TypeClass.primitive,
      assignment: assignPrimitives(name),
      hash: name,
    };
  }
  else if (isArray(value)) {
    if (value.length === 0) {
      let name = '[NSNull]'

      return {
        name,
        class: TypeClass.array,
        definition: '',
        assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
        hash: 'array',
      }
    }

    return getCommonType(value, key, definitions);
  }
  else if (typeof value === 'object') {
    let hash = hashObject(value, definitions);

    // If the Definition is already defined, use it 
    if (!!definitions[hash]) {
      let name = definitions[hash].name;

      return {
        name,
        class: TypeClass.object,
        assignment: (k: string) => `self.${k} = ${name}(${DATA_VARIABLE_NAME}["${k}"] as! NSDictionary)`,
        hash,
        definition: '', // don't redefine it
      }
    }
    else {
      let name = upperFirst(key);

      definitions[hash] = {
        definition: transform(value, name),
        name,
      };

      return {
        name: definitions[hash].name,
        class: TypeClass.object,
        definition: definitions[hash].definition,
        assignment: (k: string) => `self.${k} = ${name}(${DATA_VARIABLE_NAME}["${k}"] as! NSDictionary)`,
        hash,
      }
    }
  }
  else {
    let name = 'Any';

    return {
      name,
      class: TypeClass.primitive,
      definition: '',
      assignment: assignPrimitives(name),
      hash: name,
    };
  }
}

/**
 * Finds the common type between the Array's items if there is one and only one,
 *  or fallsback to [Any] otherwise
 */
const getCommonType = (arrayOfValues: any[], key: string, definitions: Definitions): SwiftType => {
  const getSwiftTypeOfKey = (v: any) => getSwiftType(v, key, definitions);

  const uniqHashes = R.pipe(
    R.map(getSwiftTypeOfKey),
    R.uniqBy((t) => t.hash),
  )(arrayOfValues);

  if (uniqHashes.length === 1) {
    let type = uniqHashes[0];

    let name = `[${type.name}]`;
    return {
      name,
      class: TypeClass.array,
      definition: type.definition,
      assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
      hash: `[${type.hash}]`,
    }
  }
  else {
    let name = `[Any]`;
    return {
      name,
      class: TypeClass.array,
      definition: '',
      assignment: (k: string) => `self.${k} = ${DATA_VARIABLE_NAME}["${k}"] as! ${name}`,
      hash: name,
    };
  }
};

/**
 * Each object has a specific set of key/type pairs
 * Create an abstract idenitfication (hash) based on that. 
 * This ensures properties like ORDER and VALUE are not taken in consideration, 
 *  while KEY NAME, KEY TYPE AND KEYS COUNT are.
 */
export const hashObject = (o: { [k: string]: any }, definitions: Definitions): string => {
  return R.pipe(
    R.sortBy(R.toLower),
    R.map((k: string) => k + ':' + getSwiftType(o[k], k, definitions).hash),
    (keyTypePairs: string[]) => keyTypePairs.join(''),
    hash,
  )(R.keys(o));
}