import { SwiftType } from './swift';
export declare const getSwiftType: (value: any, key: string, definitions: {
    [hash: string]: {
        definition: string;
        name: string;
    };
}) => SwiftType;
export declare const hashObject: (o: {
    [k: string]: any;
}, definitions: {
    [hash: string]: {
        definition: string;
        name: string;
    };
}) => string;
