// This file is just an interface between js and the cli, where
// each differe generator will run.

import * as Promise from 'bluebird';
import { generate as generateTSD } from './typescript';
import { generate as generateSwift } from './swift';
import { readFile } from '../util';

export const generateTypes = (jsonPath: string) => {
  return Promise
    .all([
      // generateTSD({
      //   src: jsonPath,
      //   namespace: 'Beetlejuice',
      // }),
      readFile(jsonPath).then((content) => {
        return generateSwift(content, {
          namespace: 'Beetlejuice',
        });
      })
    ])
    .catch((e) => {
      console.error('TypeGenerator Error', e);
    });
};