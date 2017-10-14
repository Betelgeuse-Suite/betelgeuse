import { ReleaseType } from 'semver';
import { FileContent } from './Diff';
export declare const detectChanges: (a: FileContent, b: FileContent) => ReleaseType;
