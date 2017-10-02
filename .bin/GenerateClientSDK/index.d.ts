/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Options } from './GenerateClientSDK.d';
export declare const generateClientSDKs: (options: Options) => Promise<[[string, string]]>;
