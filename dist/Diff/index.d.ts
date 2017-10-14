import { FileContent } from './Diff';
export * from './Diff';
export declare const getReleaseType: (prev: FileContent, next: FileContent) => "none" | "major" | "premajor" | "minor" | "preminor" | "patch" | "prepatch" | "prerelease";
