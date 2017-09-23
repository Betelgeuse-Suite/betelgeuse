import * as R from 'ramda';



export type PrimitiveTypes = 'Int' | 'String' | 'Bool' | 'Any' | 'Void';

export const getSwiftType = (value: any): PrimitiveTypes => {
  if (value == null) {
    return 'Void';
  } else if (typeof value === 'number') {
    return 'Int';
  } else if (typeof value === 'string') {
    return 'String';
  } else if (typeof value === "boolean") {
    return 'Bool';
  }

  return 'Any';
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


