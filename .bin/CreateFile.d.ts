/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare const prepend: (str: string) => string;
export declare const createFile: (outPath: string, fromStr: string) => Promise<undefined>;
