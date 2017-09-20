/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare const readFile: (path: string) => Promise<string>;
export declare const readJSONFile: (path: string) => Promise<string>;
export declare const jsonToObj: <T>(s: string) => T;
export declare const objToJson: (o: Object) => string;
export declare const writeFile: (path: string, content: string) => Promise<undefined>;
export declare type ReadFile = {
    path: string;
    content: string;
};
export declare const readFiles: (dirname: string, onDone: (...args: any[]) => void, onError: (...args: any[]) => void) => void;
export declare const makeDirRecursively: (path: string) => Promise<{}>;
export declare const passThrough: <T>(fn: (a: T) => void) => (arg: T) => Promise<T>;
export declare const passThroughAwait: <T>(fn: (a: T) => void) => (arg: T) => Promise<T>;
export declare const jsonToJSONP: (json: string) => string;
export declare const now: () => number;
