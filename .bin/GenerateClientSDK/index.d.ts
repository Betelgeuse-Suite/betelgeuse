/// <reference types="bluebird" />
import { Options } from './GenerateClientSDK.d';
import * as Promise from 'bluebird';
export declare const generateClientSDKs: (options: Options) => Promise<[[string, string]]>;
