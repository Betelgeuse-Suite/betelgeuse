import * as semver from 'semver';
import { FileContent } from './Version';
export * from './Version';
export declare const getReleaseType: (prev: FileContent, next: FileContent) => semver.ReleaseType;
export declare const getNextVersion: (prev: FileContent & {
    __version: string;
}, next: FileContent) => string | null;
export declare const applyVersion: (prev: FileContent & {
    __version: string;
}, next: FileContent) => FileContent & {
    __version: string;
};
