import * as Promise from 'bluebird';
import { generate as generateTypescriptClientSDK } from './typescript';
import { Options } from './GenerateClientSDK.d';

export const generateClientSDKs = (options: Options) => {
  return Promise.all([
    generateTypescriptClientSDK(options),
  ]);
}