import * as R from 'ramda';
import * as semver from 'semver';

import { NoChangesException } from '../Exception';
import { detectChanges } from './detectChanges';

import { FileContent,  } from './Diff';
import { ReleaseType } from 'semver';
export * from './Diff';


type RawFileContent = FileContent & {
  __version: string;
}

export const getReleaseType = (prev: FileContent, next: FileContent): ReleaseType | 'none' => {
  return detectChanges(prev, next) || 'none';
}
