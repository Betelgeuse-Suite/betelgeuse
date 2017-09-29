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
  hash: string;
}

export type AnyJSON = {
  [k: string]: any;
  [k: number]: string;
}

export type InstanceProperty = {
  declaration: string;
  assignment: string;
  typeDefinition: string;
}