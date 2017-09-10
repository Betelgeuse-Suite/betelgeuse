import { generate as generateTypescriptClientSDK } from './typescript';

export const generateClientSDKs = (appName: string) => {
  return Promise.all([
    generateTypescriptClientSDK(appName),
  ]);
}