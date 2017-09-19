import * as R from 'ramda';
import { diff } from 'deep-diff';
import { ReleaseType } from 'semver';
import { FileContent } from './Diff';

type ChangeType = { [index: string]: ReleaseType }
type ChangeTypePriorities = { [index: string]: number };

const changeTypes: ChangeType = {
  E: 'patch',
  N: 'minor',
  D: 'major',
}

const changeTypePriorities: ChangeTypePriorities = {
  NONE: 0,
  E: 10,
  N: 20,
  D: 30,
};

const getChangesKind = R.reduce(
  (prevKind, { kind }) => ((changeTypePriorities[kind] > changeTypePriorities[prevKind]) ? kind : prevKind),
  'NONE',
);

export const detectChanges = (a: FileContent, b: FileContent): ReleaseType => {
  return changeTypes[getChangesKind(diff(a, b) || [])];
};
