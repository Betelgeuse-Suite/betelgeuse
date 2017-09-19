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


export const getNextVersion = 
  (prev: RawFileContent, next: FileContent) => semver.inc(
      prev.__version,
      detectChanges(R.omit(['__version'], prev), next) || 'none'
  );

export const applyVersion = 
  (prev: RawFileContent, next: FileContent): RawFileContent => {
    const nextVersion = getNextVersion(prev, next);

    if (nextVersion === null) {
      throw new NoChangesException();
    }


    // TODO: Thinking of not applying hte version at this point,
    //  instead just return a ReleaseType, and apply much higher up when saving to S3 for ex
    //  This will make the file ahndling much easier, since there won't be any side effects.
    return R.merge(next, {__version: nextVersion});
  };
