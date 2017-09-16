/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Options } from './GenerateClientSDK';
export declare const generate: (options: Options) => Promise<[string, string]>;
