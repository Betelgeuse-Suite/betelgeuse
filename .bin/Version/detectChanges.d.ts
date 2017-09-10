import { ReleaseType } from 'semver';
import { FileContent } from './Version';
export declare const detectChanges: (a: FileContent, b: FileContent) => ReleaseType;
