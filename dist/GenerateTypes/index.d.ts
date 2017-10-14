/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare enum Platform {
    swift = 0,
    typescript = 1,
}
export declare const generateTypes: (jsonPath: string, platform: Platform) => Promise<string>;
