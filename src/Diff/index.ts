import * as R from 'ramda';
import * as semver from 'semver';

export * from './Diff';
import { NoChangesException } from '../Exception';
import { detectChanges } from './detectChanges';
import { FileContent,  } from './Diff';
import { BetelgeuseReleaseType } from '../Betelgeuse';


type RawFileContent = FileContent & {
  __version: string;
}

export const getReleaseType = (prev: FileContent, next: FileContent): BetelgeuseReleaseType => {
  return detectChanges(prev, next) || 'none';
}
