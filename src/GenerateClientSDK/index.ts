import { generate as generateTypescriptClientSDK } from './typescript';
import { Options } from './GenerateClientSDK.d';
import * as Promise from 'bluebird';

export const generateClientSDKs = (options: Options) => {
  return Promise.all([
    generateTypescriptClientSDK(options),
  ]);
}