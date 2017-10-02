// This file is just an interface between js and the cli, where
// each differe generator will run.

import * as Promise from 'bluebird';
import { generate as generateTSD } from './typescript';
import { generate as generateSwift } from './swift';
import { readFile } from '../util';

export enum Platform {
  swift,
  typescript,
}

export const generateTypes = (jsonPath: string, platform: Platform) => {
  const generatorsByPlatform = {
    [Platform.swift]: Promise
      .resolve(readFile(jsonPath))
      .then((content) => generateSwift(content, {
        namespace: 'Model',
      })),
    [Platform.typescript]: Promise
      .resolve()
      .then(() => generateTSD({
        src: jsonPath,
        namespace: 'Beetlejuice',
      })),
  }

  return Promise
    .resolve(generatorsByPlatform[platform])
    .catch((e) => {
      console.error('TypeGenerator Error', e);
    });
};