export declare enum TypeClass {
    primitive = 0,
    array = 1,
    object = 2,
}
export declare type PrimitiveTypes = 'Int' | 'Double' | 'String' | 'Bool' | 'Any' | 'NSNull';
export declare type SwiftType = {
    name: PrimitiveTypes | string;
    class: TypeClass;
    definition: string;
    assignment: (k: string) => string;
    hash: string;
};
export declare type AnyJSON = {
    [k: string]: any;
    [k: number]: string;
};
export declare type InstanceProperty = {
    declaration: string;
    assignment: string;
    typeDefinition: string;
};
