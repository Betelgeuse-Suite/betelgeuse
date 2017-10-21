import * as Semver from 'Semver';

export enum Platform {
  swift,
  typescript,
}

export type BetelgeuseReleaseType = Semver.ReleaseType | 'none';